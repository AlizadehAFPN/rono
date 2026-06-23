"""
Seed *provisional* (expert-judged) difficulty for the 2013-TUS İlkbahar / TTBT
question set — a cold-start estimate so the adaptive selector has something better
than the neutral default (b=0) before any real student responses accrue.

This is NOT response-based IRT calibration. It writes the platform's existing
expert-difficulty channel: a 1–5 ``difficulty_preset`` mapped to ``irt_b`` via the
same ``_PRESET_TO_IRT_B`` table used by the item editor, with ``irt_a=1.0`` and
``calibration_status='pre_set'``. Once an item accumulates >= MIN_CALIBRATION_N
graded responses, scripts/calibrate_items.py will overwrite these with real (a, b)
and flip the status to 'calibrated'.

How the levels were assigned
----------------------------
Each question was read and rated by cognitive demand for an average TUS examinee
(medical graduate): high-yield recall of a classic fact = easy; obscure detail,
numeric trivia, or "which statement is WRONG" items needing full mastery = hard;
clinical-reasoning vignettes = medium. Levels map to an estimated facility p and
the platform's b buckets:

    1  very easy  (b=-2.0, p~0.88)   2  easy (b=-1.0, p~0.73)
    3  medium     (b= 0.0, p~0.50)   4  hard (b=+1.0, p~0.27)
    5  very hard  (b=+2.0, p~0.12)

Idempotent and safe: only items still 'uncalibrated' or 'pre_set' are touched, so
re-running is fine and a real calibration is never clobbered. Q66 is 'iptal'
(cancelled / retired) and is intentionally skipped.

Usage (inside the backend container):
    PYTHONPATH=src uv run python scripts/seed_provisional_difficulty.py [--dry-run]
"""

import argparse
import asyncio
import sys

import structlog

sys.path.insert(0, "src")

from sqlalchemy import select
from sqlalchemy import update as sql_update

from app.core.database import AsyncSessionLocal
from app.models.item import Item
from app.models.item_tag import ItemTag

log = structlog.get_logger()

SRC_REF = "2013-TUS İlkbahar / TTBT"

# Same mapping the item editor / item_service uses for difficulty_preset -> irt_b.
_PRESET_TO_IRT_B = {1: -2.0, 2: -1.0, 3: 0.0, 4: 1.0, 5: 2.0}

# q_no -> expert difficulty level (1..5). Q66 omitted (iptal/cancelled).
PRESET: dict[int, int] = {
    # --- Anatomy / Histology-Embryology (1-22) ---
    1: 4, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 2, 9: 3, 10: 2,
    11: 4, 12: 2, 13: 3, 14: 4, 15: 4, 16: 3, 17: 3, 18: 2, 19: 2, 20: 2,
    21: 2, 22: 2,
    # --- Physiology (23-32) ---
    23: 3, 24: 4, 25: 2, 26: 4, 27: 3, 28: 3, 29: 3, 30: 3, 31: 3, 32: 3,
    # --- Biochemistry (33-54) ---
    33: 3, 34: 4, 35: 4, 36: 4, 37: 2, 38: 3, 39: 3, 40: 3, 41: 4, 42: 2,
    43: 3, 44: 2, 45: 3, 46: 2, 47: 3, 48: 3, 49: 2, 50: 3, 51: 4, 52: 3,
    53: 2, 54: 4,
    # --- Microbiology (55-76), 66 = iptal (skipped) ---
    55: 3, 56: 3, 57: 4, 58: 4, 59: 3, 60: 3, 61: 3, 62: 2, 63: 2, 64: 3,
    65: 3, 67: 4, 68: 3, 69: 4, 70: 4, 71: 4, 72: 2, 73: 4, 74: 2, 75: 3,
    76: 4,
    # --- Pathology (77-98) ---
    77: 2, 78: 2, 79: 3, 80: 4, 81: 3, 82: 2, 83: 2, 84: 2, 85: 2, 86: 2,
    87: 3, 88: 2, 89: 3, 90: 4, 91: 3, 92: 2, 93: 4, 94: 3, 95: 3, 96: 4,
    97: 3, 98: 3,
    # --- Pharmacology (99-120) ---
    99: 2, 100: 3, 101: 4, 102: 3, 103: 2, 104: 3, 105: 4, 106: 3, 107: 3,
    108: 4, 109: 4, 110: 3, 111: 2, 112: 3, 113: 2, 114: 4, 115: 3, 116: 4,
    117: 4, 118: 2, 119: 4, 120: 2,
}


async def seed(dry_run: bool) -> None:
    updated = missing = skipped = 0
    async with AsyncSessionLocal() as db:
        for qno, level in sorted(PRESET.items()):
            tag = (
                await db.execute(
                    select(ItemTag).where(
                        ItemTag.tag_key == "q_no",
                        ItemTag.tag_value == f"{SRC_REF}#{qno}",
                    )
                )
            ).scalar_one_or_none()
            if tag is None:
                log.warning("item.missing", qno=qno)
                missing += 1
                continue

            item = (
                await db.execute(select(Item).where(Item.id == tag.item_id))
            ).scalar_one()

            # Never clobber a real, response-based calibration.
            if item.calibration_status not in ("uncalibrated", "pre_set"):
                skipped += 1
                continue

            b = _PRESET_TO_IRT_B[level]
            if not dry_run:
                await db.execute(
                    sql_update(Item)
                    .where(Item.id == item.id)
                    .values(irt_a=1.0, irt_b=b, calibration_status="pre_set")
                )
            updated += 1
            print(f"q{qno:>3}  level {level}  irt_b={b:+.1f}  [{item.calibration_status}]")

        if dry_run:
            await db.rollback()
            print("\n(dry-run: nothing committed)")
        else:
            await db.commit()

    log.info("seed.done", updated=updated, missing=missing, skipped=skipped, dry_run=dry_run)
    print(f"\nupdated={updated} missing={missing} skipped={skipped} dry_run={dry_run}")


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="show changes, commit nothing")
    args = parser.parse_args()
    await seed(args.dry_run)


if __name__ == "__main__":
    asyncio.run(main())

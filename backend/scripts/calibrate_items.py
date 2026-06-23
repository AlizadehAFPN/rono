"""
IRT calibration job — turn accumulated responses into per-item 2PL parameters.

For each item with enough graded responses, fits (a, b) from the abilities
recorded at answer time (Response.theta_at_response) and writes them back to the
item, flipping calibration_status to 'calibrated'. Once calibrated, the adaptive
selector can genuinely match question difficulty to each student's ability.

Run manually or via cron (e.g. weekly):
    PYTHONPATH=src uv run python scripts/calibrate_items.py [--min N]
"""

import argparse
import asyncio
import sys
from datetime import UTC, datetime

import structlog

sys.path.insert(0, "src")

from sqlalchemy import select
from sqlalchemy import update as sql_update

from app.core.database import AsyncSessionLocal
from app.models.item import Item
from app.models.response import Response
from app.services.irt.engine import MIN_CALIBRATION_N, calibrate_2pl

log = structlog.get_logger()


async def calibrate(min_responses: int) -> None:
    calibrated = skipped = 0
    async with AsyncSessionLocal() as db:
        item_ids = (
            await db.execute(select(Item.id).where(Item.deleted_at.is_(None)))
        ).scalars().all()

        for item_id in item_ids:
            rows = (
                await db.execute(
                    select(Response.theta_at_response, Response.is_correct).where(
                        Response.item_id == item_id,
                        Response.is_correct.is_not(None),
                        Response.theta_at_response.is_not(None),
                    )
                )
            ).all()
            points = [(float(theta), bool(correct)) for (theta, correct) in rows]

            result = calibrate_2pl(points, min_responses=min_responses)
            if result is None:
                skipped += 1
                continue

            await db.execute(
                sql_update(Item)
                .where(Item.id == item_id)
                .values(
                    irt_a=result.a,
                    irt_b=result.b,
                    irt_responses_used=result.n_responses,
                    calibration_status="calibrated",
                    irt_last_calibrated_at=datetime.now(UTC),
                )
            )
            calibrated += 1

        await db.commit()

    log.info("calibrate.done", calibrated=calibrated, skipped=skipped, min=min_responses)
    print(f"calibrated={calibrated} skipped={skipped} min_responses={min_responses}")


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--min", type=int, default=MIN_CALIBRATION_N)
    args = parser.parse_args()
    await calibrate(args.min)


if __name__ == "__main__":
    asyncio.run(main())

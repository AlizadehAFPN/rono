"""
Import a question set (JSON) into the live database.

Designed for official past papers like the 2013-TUS Temel Tıp Bilimleri test.
Each question becomes an Item + ItemVersion + Options, tagged with exam_type,
exam_part, provenance, and linked to its subject topic (global TUS taxonomy).

Idempotent: a question is keyed by (source_reference, q_no) via an ItemTag, so
re-running skips already-imported questions.

JSON shape:
{
  "exam_type": "tus",
  "exam_part": "basic_sciences",
  "source": "osym",
  "source_reference": "2013-TUS İlkbahar / TTBT",
  "exam_year": 2013,
  "exam_session": "spring",
  "language": "tr",
  "questions": [
    {"no": 1, "subject": "anatomy", "stem": "...",
     "options": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
     "answer": "E", "iptal": false}
  ]
}

Usage (inside the backend container):
    PYTHONPATH=src uv run python scripts/import_questions.py scripts/data/<file>.json
"""

import asyncio
import json
import sys
import uuid

import structlog

sys.path.insert(0, "src")

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.institution import Institution
from app.models.item import Item
from app.models.item_tag import ItemTag
from app.models.item_topic_link import ItemTopicLink
from app.models.item_version import ItemVersion
from app.models.option import Option
from app.models.topic import Topic
from app.models.user import User

log = structlog.get_logger()

# Subject key -> global TUS topic slug (seeded by migration a7b8c9d0e1f2).
SUBJECT_SLUG = {
    "anatomy": "tus-anatomi",
    "histology": "tus-histoloji-embriyoloji",
    "physiology": "tus-fizyoloji",
    "biochemistry": "tus-biyokimya",
    "microbiology": "tus-mikrobiyoloji",
    "pathology": "tus-patoloji",
    "pharmacology": "tus-farmakoloji",
}


async def _import(path: str) -> None:
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)

    meta = {k: data.get(k) for k in (
        "exam_type", "exam_part", "source", "source_reference",
        "exam_year", "exam_session", "language",
    )}
    src_ref = meta["source_reference"]
    questions = data["questions"]

    async with AsyncSessionLocal() as db:
        institution = (await db.execute(select(Institution).limit(1))).scalar_one()
        author = (
            await db.execute(select(User).where(User.email.ilike("admin@%")).limit(1))
        ).scalar_one_or_none()
        author_id = author.id if author else None

        # subject slug -> topic id
        slugs = list(SUBJECT_SLUG.values())
        topics = (
            await db.execute(
                select(Topic).where(Topic.slug.in_(slugs), Topic.institution_id.is_(None))
            )
        ).scalars().all()
        topic_by_slug = {t.slug: t for t in topics}

        created = skipped = 0
        for q in questions:
            qno = q["no"]
            # idempotency: skip if this (src_ref, qno) already imported
            exists = (
                await db.execute(
                    select(ItemTag).where(
                        ItemTag.tag_key == "q_no",
                        ItemTag.tag_value == f"{src_ref}#{qno}",
                    )
                )
            ).scalar_one_or_none()
            if exists is not None:
                skipped += 1
                continue

            is_iptal = bool(q.get("iptal"))
            status = "retired" if is_iptal else "active"
            answer = (q.get("answer") or "").strip().upper()

            item = Item(
                institution_id=institution.id,
                item_type="single_best_answer",
                exam_type=meta["exam_type"],
                exam_part=meta["exam_part"],
                language=meta.get("language") or "tr",
                source=meta["source"],
                source_reference=src_ref,
                exam_year=meta["exam_year"],
                exam_session=meta["exam_session"],
                status=status,
                created_by_id=author_id,
            )
            db.add(item)
            await db.flush()

            version = ItemVersion(
                item_id=item.id,
                version_number=1,
                content=q["stem"],
                authored_by_id=author_id,
                is_published=not is_iptal,
            )
            db.add(version)
            await db.flush()

            for i, key in enumerate(["A", "B", "C", "D", "E"]):
                if key not in q["options"]:
                    continue
                db.add(Option(
                    item_version_id=version.id,
                    key=key,
                    content=q["options"][key],
                    is_correct=(key == answer and not is_iptal),
                    display_order=i,
                ))

            item.current_version_id = version.id

            subject_slug = SUBJECT_SLUG.get(q["subject"])
            topic = topic_by_slug.get(subject_slug) if subject_slug else None
            if topic is not None:
                db.add(ItemTopicLink(
                    item_id=item.id, topic_id=topic.id, is_primary=True, created_by_id=author_id
                ))

            # provenance tags (also the idempotency key)
            db.add(ItemTag(item_id=item.id, tag_key="q_no", tag_value=f"{src_ref}#{qno}"))
            await db.flush()
            created += 1

        await db.commit()
        log.info("import.done", created=created, skipped=skipped, total=len(questions))
        print(f"created={created} skipped={skipped} total={len(questions)}")


if __name__ == "__main__":
    asyncio.run(_import(sys.argv[1]))

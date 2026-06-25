"""
Idempotent seed for the PhD-entrance aptitude test (استعداد تحصیلی) taxonomy.

Four global level-0 subjects (``institution_id = NULL``), one per استعداد section
of سنجش's doctoral aptitude booklet. The JSON importer links a question to its
section by slug (the ``subject`` field == the slug below).

Usage (inside the backend container / venv):
    PYTHONPATH=src python scripts/seed_aptitude_topics.py

Idempotent: a topic is inserted only if no global topic with that slug exists, so
re-running is safe.
"""

import asyncio
import sys
import uuid

import structlog

sys.path.insert(0, "src")

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.topic import Topic

log = structlog.get_logger()

# (subject_name, subject_slug)
APTITUDE_SUBJECTS: list[tuple[str, str]] = [
    ("درک مطلب", "apt-reading"),
    ("استعداد کمّی", "apt-quant"),
    ("استعداد تحلیلی", "apt-analytical"),
    ("استعداد تجسمی", "apt-spatial"),
]


async def _get_or_create_global_topic(
    db: AsyncSession, name: str, slug: str, display_order: int
) -> Topic:
    """Create a global (institution_id IS NULL) level-0 topic if it's missing."""
    existing = (
        await db.execute(
            select(Topic).where(Topic.slug == slug, Topic.institution_id.is_(None))
        )
    ).scalar_one_or_none()
    if existing is not None:
        log.info("aptitude_seed.topic_exists", slug=slug)
        return existing

    new_id = uuid.uuid4()
    topic = Topic(
        id=new_id,
        institution_id=None,  # global taxonomy
        parent_id=None,
        name=name,
        slug=slug,
        path=f"/{new_id}",
        level=0,
        display_order=display_order,
    )
    db.add(topic)
    await db.flush()
    log.info("aptitude_seed.topic_created", slug=slug)
    return topic


async def main() -> None:
    async with AsyncSessionLocal() as db:
        log.info("aptitude_seed.start")
        # display_order offset keeps these after the employment-exam subjects.
        for order, (name, slug) in enumerate(APTITUDE_SUBJECTS, start=100):
            await _get_or_create_global_topic(db, name, slug, display_order=order)
        await db.commit()
        log.info("aptitude_seed.done")


if __name__ == "__main__":
    asyncio.run(main())

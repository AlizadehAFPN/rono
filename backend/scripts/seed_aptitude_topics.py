"""
Idempotent seed for the PhD-entrance aptitude test (هوش و استعداد تحصیلی).

A single global level-0 subject (``institution_id = NULL``). The aptitude exam is
one subject; its internal question types (reading / quantitative / analytical /
spatial) are a property of each question, not separate subjects, so they are NOT
modelled as topics. The JSON importer links a question to this subject by slug
(the ``subject`` field == ``aptitude``).

Usage (inside the backend container / venv):
    PYTHONPATH=src python scripts/seed_aptitude_topics.py

Idempotent: inserted only if no global topic with this slug exists.
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

APTITUDE_SUBJECT = ("هوش و استعداد تحصیلی", "aptitude")


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
        name, slug = APTITUDE_SUBJECT
        await _get_or_create_global_topic(db, name, slug, display_order=100)
        await db.commit()
        log.info("aptitude_seed.done")


if __name__ == "__main__":
    asyncio.run(main())

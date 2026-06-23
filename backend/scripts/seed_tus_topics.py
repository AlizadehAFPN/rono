"""
Idempotent seed for the TUS subject taxonomy (global topics).

TUS (Tıpta Uzmanlık Eğitimi Giriş Sınavı) has two exam parts, modelled on the
``items.exam_part`` column — NOT in the topic tree:
    - basic_sciences    (Temel Tıp Bilimleri Testi / TTBT)
    - clinical_sciences (Klinik Tıp Bilimleri Testi / KTBT)

The topic tree here is *subject-based* and orthogonal to exam_part: a question is
tagged ``exam_part="basic_sciences"`` AND linked to a subject such as "Anatomi".
Topics are created **global** (``institution_id=NULL``) so every institution
shares the national TUS taxonomy, per the architecture decision on global topics.

Subjects are created at level 0; the hierarchy supports deeper
Subject → Domain → Sub-domain nesting later (4-level design).

Usage (inside the backend container / venv):
    PYTHONPATH=src python scripts/seed_tus_topics.py

Idempotent: a topic is inserted only if no global topic with that slug exists.
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

# TUS Temel Tıp Bilimleri (TTBT) — basic-science subjects.
BASIC_SCIENCE_SUBJECTS: list[tuple[str, str]] = [
    ("Anatomi", "tus-anatomi"),
    ("Histoloji ve Embriyoloji", "tus-histoloji-embriyoloji"),
    ("Fizyoloji", "tus-fizyoloji"),
    ("Biyokimya", "tus-biyokimya"),
    ("Mikrobiyoloji", "tus-mikrobiyoloji"),
    ("Patoloji", "tus-patoloji"),
    ("Farmakoloji", "tus-farmakoloji"),
]

# TUS Klinik Tıp Bilimleri (KTBT) — clinical-science subjects.
CLINICAL_SCIENCE_SUBJECTS: list[tuple[str, str]] = [
    ("Dahiliye (İç Hastalıkları)", "tus-dahiliye"),
    ("Pediatri", "tus-pediatri"),
    ("Genel Cerrahi", "tus-genel-cerrahi"),
    ("Kadın Hastalıkları ve Doğum", "tus-kadin-dogum"),
    ("Psikiyatri", "tus-psikiyatri"),
    ("Nöroloji", "tus-noroloji"),
    ("Anesteziyoloji ve Reanimasyon", "tus-anesteziyoloji"),
    ("Radyoloji", "tus-radyoloji"),
    ("Halk Sağlığı", "tus-halk-sagligi"),
]


async def _get_or_create_global_topic(
    db: AsyncSession,
    name: str,
    slug: str,
    parent: Topic | None = None,
    display_order: int = 0,
) -> Topic:
    """Create a global (institution_id IS NULL) topic if it doesn't exist."""
    existing = (
        await db.execute(
            select(Topic).where(Topic.slug == slug, Topic.institution_id.is_(None))
        )
    ).scalar_one_or_none()
    if existing is not None:
        log.info("tus_seed.topic_exists", slug=slug)
        return existing

    new_id = uuid.uuid4()
    if parent is not None:
        path = f"{parent.path}/{new_id}"
        level = parent.level + 1
    else:
        path = f"/{new_id}"
        level = 0

    topic = Topic(
        id=new_id,
        institution_id=None,  # global taxonomy
        parent_id=parent.id if parent else None,
        name=name,
        slug=slug,
        path=path,
        level=level,
        display_order=display_order,
    )
    db.add(topic)
    await db.flush()
    log.info("tus_seed.topic_created", slug=slug, level=level)
    return topic


async def seed_tus_topics(db: AsyncSession) -> None:
    log.info("tus_seed.start")
    for order, (name, slug) in enumerate(BASIC_SCIENCE_SUBJECTS):
        await _get_or_create_global_topic(db, name, slug, display_order=order)
    for order, (name, slug) in enumerate(CLINICAL_SCIENCE_SUBJECTS):
        await _get_or_create_global_topic(db, name, slug, display_order=order)
    await db.commit()
    log.info("tus_seed.done")


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed_tus_topics(db)


if __name__ == "__main__":
    asyncio.run(main())

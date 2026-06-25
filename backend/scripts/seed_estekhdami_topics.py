"""
Idempotent seed for the Iran employment-exam (آزمون استخدامی) subject taxonomy.

Two levels only — درس (level 0) → مبحث (level 1) — created as **global** topics
(``institution_id = NULL``) so every institution shares the national taxonomy.
See RONO_EXAM_TAXONOMY.md (repo root) for the decision record.

Structure:
  - General subjects (دروس عمومی): shared across ALL exams. Each has its مباحث.
  - Specialized subjects (دروس تخصصی): per-exam skeleton, level-0 only for now —
    their مباحث are added later alongside real content.

The ``items.exam_type`` / ``exam_part`` columns carry the exam + general/specialized
split; this tree is subject-based and orthogonal to them. The JSON importer links a
question to its مبحث by slug (the ``subject`` field == the slug below).

Note: exams are NOT seeded as Curriculum rows — Curriculum is institution-scoped and
tied to enrollment programs, which the question bank does not need. The exam list
lives in ``app/core/exams.py::EXAM_TYPES``.

Usage (inside the backend container / venv):
    PYTHONPATH=src python scripts/seed_estekhdami_topics.py

Idempotent: a topic is inserted only if no global topic with that slug exists, so
re-running is safe and adding new subjects/مباحث here just tops up the tree.
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

# ── دروس عمومی (مشترک بین همه‌ی آزمون‌ها) ──────────────────────────────────────
# (subject_name, subject_slug, [(topic_name, topic_slug), ...])
GENERAL_SUBJECTS: list[tuple[str, str, list[tuple[str, str]]]] = [
    ("زبان و ادبیات فارسی", "gen-persian", [
        ("قرابت معنایی", "gen-persian-qarabat"),
        ("دستور زبان و نگارش", "gen-persian-dastur"),
        ("آرایه‌های ادبی", "gen-persian-arayeh"),
        ("تاریخ ادبیات و سبک‌شناسی", "gen-persian-tarikh"),
        ("معنی واژگان و املا", "gen-persian-vajegan"),
    ]),
    ("معارف اسلامی", "gen-maaref", [
        ("قرآن و تفسیر", "gen-maaref-quran"),
        ("احکام", "gen-maaref-ahkam"),
        ("اعتقادات و اصول دین", "gen-maaref-aqaed"),
        ("تاریخ اسلام", "gen-maaref-tarikh"),
        ("اخلاق اسلامی", "gen-maaref-akhlaq"),
    ]),
    ("زبان انگلیسی", "gen-english", [
        ("گرامر", "gen-english-grammar"),
        ("واژگان", "gen-english-vocabulary"),
        ("درک مطلب", "gen-english-reading"),
        ("کلوز تست", "gen-english-cloze"),
    ]),
    ("ریاضی و آمار مقدماتی", "gen-math", [
        ("حساب، درصد و نسبت", "gen-math-arithmetic"),
        ("جبر و معادلات", "gen-math-algebra"),
        ("آمار و احتمال مقدماتی", "gen-math-statistics"),
        ("تحلیل داده و نمودار", "gen-math-data"),
    ]),
    ("هوش و استعداد", "gen-aptitude", [
        ("استدلال منطقی", "gen-aptitude-logic"),
        ("سری‌ها و تشخیص الگو", "gen-aptitude-series"),
        ("هوش کلامی", "gen-aptitude-verbal"),
        ("هوش تصویری و فضایی", "gen-aptitude-spatial"),
    ]),
    ("مهارت‌های کامپیوتر (ICDL)", "gen-ict", [
        ("مفاهیم پایه کامپیوتر و شبکه", "gen-ict-concepts"),
        ("ویندوز و مدیریت فایل", "gen-ict-windows"),
        ("واژه‌پرداز Word", "gen-ict-word"),
        ("صفحه‌گسترده Excel", "gen-ict-excel"),
        ("ارائه PowerPoint", "gen-ict-powerpoint"),
        ("اینترنت و ایمیل", "gen-ict-internet"),
    ]),
    ("اطلاعات عمومی، اجتماعی و قانون اساسی", "gen-general", [
        ("اطلاعات عمومی و سیاسی روز", "gen-general-current"),
        ("قانون اساسی", "gen-general-constitution"),
        ("مسائل اجتماعی و فرهنگی", "gen-general-social"),
        ("تاریخ و جغرافیای ایران", "gen-general-iran"),
    ]),
]

# ── دروس تخصصی (اسکلت — به تفکیک آزمون، فعلاً سطح ۰) ───────────────────────────
# نیازمند بازبینی با دفترچه‌ی رسمیِ هر رشته‌ی شغلی؛ مباحثشان همراه محتوای واقعی اضافه می‌شود.
# (exam_label, [(subject_name, subject_slug), ...])
SPECIALIZED_SUBJECTS: list[tuple[str, list[tuple[str, str]]]] = [
    ("آموزش و پرورش", [
        ("تعلیم و تربیت", "edu-pedagogy"),
        ("روان‌شناسی پرورشی و تربیتی", "edu-psychology"),
        ("سنجش و اندازه‌گیری", "edu-measurement"),
        ("روش‌ها و فنون تدریس", "edu-teaching-methods"),
        ("علم‌النفس از دیدگاه دانشمندان اسلامی", "edu-islamic-psych"),
    ]),
    ("بانک‌ها", [
        ("حسابداری", "bank-accounting"),
        ("اقتصاد", "bank-economics"),
        ("پول و بانکداری", "bank-money-banking"),
        ("ریاضیات مالی", "bank-financial-math"),
        ("حقوق بانکی و تجارت", "bank-law"),
        ("فناوری اطلاعات", "bank-it"),
    ]),
    ("تأمین اجتماعی", [
        ("قوانین و مقررات تأمین اجتماعی", "ss-ss-law"),
        ("حسابداری", "ss-accounting"),
        ("حقوق", "ss-law"),
        ("مدیریت", "ss-management"),
        ("کامپیوتر", "ss-it"),
    ]),
    ("دستگاه‌های اجرایی (فراگیر)", [
        ("حسابداری", "exec-accounting"),
        ("حقوق", "exec-law"),
        ("مدیریت", "exec-management"),
        ("فناوری اطلاعات", "exec-it"),
    ]),
]


async def _get_or_create_global_topic(
    db: AsyncSession,
    name: str,
    slug: str,
    parent: Topic | None = None,
    display_order: int = 0,
) -> Topic:
    """Create a global (institution_id IS NULL) topic if it doesn't already exist."""
    existing = (
        await db.execute(
            select(Topic).where(Topic.slug == slug, Topic.institution_id.is_(None))
        )
    ).scalar_one_or_none()
    if existing is not None:
        log.info("estekhdami_seed.topic_exists", slug=slug)
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
    log.info("estekhdami_seed.topic_created", slug=slug, level=level)
    return topic


async def seed_estekhdami_topics(db: AsyncSession) -> None:
    log.info("estekhdami_seed.start")

    # General subjects (level 0) + their مباحث (level 1).
    for s_order, (subject_name, subject_slug, topics) in enumerate(GENERAL_SUBJECTS):
        subject = await _get_or_create_global_topic(
            db, subject_name, subject_slug, display_order=s_order
        )
        for t_order, (topic_name, topic_slug) in enumerate(topics):
            await _get_or_create_global_topic(
                db, topic_name, topic_slug, parent=subject, display_order=t_order
            )

    # Specialized subjects (level 0 skeleton). display_order continues after general
    # so the tree lists general subjects first.
    order = len(GENERAL_SUBJECTS)
    for _exam_label, subjects in SPECIALIZED_SUBJECTS:
        for subject_name, subject_slug in subjects:
            await _get_or_create_global_topic(
                db, subject_name, subject_slug, display_order=order
            )
            order += 1

    await db.commit()
    log.info("estekhdami_seed.done")


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed_estekhdami_topics(db)


if __name__ == "__main__":
    asyncio.run(main())

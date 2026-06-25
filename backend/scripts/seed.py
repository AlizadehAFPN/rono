"""
Idempotent database seed script for development and testing.

Creates (employment-exam demo data):
  1. Institution  : "آموزشگاه نمونه‌ی رونو"  (slug: rono-demo)
  2. Admin user   : admin@rono-demo.edu     / Admin1234!  (institution_admin)
  3. Instructor   : instructor@rono-demo.edu / Teach1234! (instructor)
  4. Student      : student@rono-demo.edu   / Study1234!  (student)
  5. Topic tree   : زبان و ادبیات فارسی → قرابت معنایی
                    ریاضی و آمار → درصد و نسبت
  6. Items (3)    : 2 سؤال فعال (education/general) + 1 پیش‌نویس

For the full national taxonomy (7 general subjects + specialized), run
scripts/seed_estekhdami_topics.py (make seed-topics).

Idempotency: each entity is inserted only if it does not already exist
(checked by unique key before inserting). Safe to run multiple times.

Usage (from inside the Docker backend container):
    PYTHONPATH=src uv run python scripts/seed.py

Makefile shortcut:
    make seed
"""

import asyncio
import sys
import uuid

import structlog

# PYTHONPATH must include 'src' before running this script
sys.path.insert(0, "src")

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models import (  # noqa: F401 — registers all models with Base.metadata
    Assignment,
    AuditLog,
    AuthSession,
    BackgroundJob,
    CardState,
    CohortSnapshot,
    Curriculum,
    CurriculumEnrollment,
    FeatureFlag,
    Institution,
    IrtCalibrationRun,
    Item,
    ItemAnalytics,
    ItemFlag,
    ItemTag,
    ItemTopicLink,
    ItemVersion,
    MediaAsset,
    Membership,
    Notification,
    NotificationTemplate,
    Option,
    PasswordResetToken,
    Permission,
    PracticeSession,
    ReportDefinition,
    Response,
    ReviewLog,
    ThetaHistory,
    Topic,
    User,
    UserTheta,
    UserTopicMastery,
)

log = structlog.get_logger()

# ---------------------------------------------------------------------------
# Seed data constants
# ---------------------------------------------------------------------------

INSTITUTION_SLUG = "rono-demo"
ADMIN_EMAIL = "admin@rono-demo.edu"
INSTRUCTOR_EMAIL = "instructor@rono-demo.edu"
STUDENT_EMAIL = "student@rono-demo.edu"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_or_create_institution(db: AsyncSession) -> Institution:
    result = await db.execute(select(Institution).where(Institution.slug == INSTITUTION_SLUG))
    inst = result.scalar_one_or_none()
    if inst:
        log.info("seed.institution_exists", slug=INSTITUTION_SLUG)
        return inst

    inst = Institution(
        name="آموزشگاه نمونه‌ی رونو",
        slug=INSTITUTION_SLUG,
        subscription_tier="pro",
    )
    db.add(inst)
    await db.flush()
    log.info("seed.institution_created", slug=INSTITUTION_SLUG, id=str(inst.id))
    return inst


async def _get_or_create_user(
    db: AsyncSession,
    email: str,
    full_name: str,
    password: str,
    institution: Institution,
    role: str,
) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
        )
        db.add(user)
        await db.flush()
        log.info("seed.user_created", email=email, id=str(user.id))
    else:
        log.info("seed.user_exists", email=email)

    # Check/create membership
    result = await db.execute(
        select(Membership).where(
            Membership.user_id == user.id,
            Membership.institution_id == institution.id,
        )
    )
    if result.scalar_one_or_none() is None:
        db.add(
            Membership(
                user_id=user.id,
                institution_id=institution.id,
                role=role,
                status="active",
            )
        )
        await db.flush()
        log.info("seed.membership_created", email=email, role=role)

    return user


async def _get_or_create_topic(
    db: AsyncSession,
    name: str,
    slug: str,
    institution_id: uuid.UUID,
    created_by_id: uuid.UUID,
    parent: Topic | None = None,
) -> Topic:
    # Check by slug + institution
    result = await db.execute(
        select(Topic).where(
            Topic.slug == slug,
            Topic.institution_id == institution_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        log.info("seed.topic_exists", slug=slug)
        return existing

    new_id = uuid.uuid4()
    if parent:
        path = f"{parent.path}/{new_id}"
        level = parent.level + 1
    else:
        path = f"/{new_id}"
        level = 0

    topic = Topic(
        id=new_id,
        institution_id=institution_id,
        parent_id=parent.id if parent else None,
        name=name,
        slug=slug,
        path=path,
        level=level,
        created_by_id=created_by_id,
    )
    db.add(topic)
    await db.flush()
    log.info("seed.topic_created", slug=slug, level=level)
    return topic


async def _create_item_if_not_exists(
    db: AsyncSession,
    institution_id: uuid.UUID,
    created_by_id: uuid.UUID,
    topic: Topic,
    question_content: str,
    explanation: str,
    options: list[dict],
    status: str = "active",
    exam_type: str | None = None,
    exam_part: str | None = None,
) -> Item | None:
    # Check by content prefix (good-enough for seed idempotency)
    result = await db.execute(
        select(ItemVersion)
        .join(Item, Item.id == ItemVersion.item_id)
        .where(
            Item.institution_id == institution_id,
            ItemVersion.content.ilike(question_content[:50] + "%"),
        )
        .limit(1)
    )
    if result.scalar_one_or_none() is not None:
        log.info("seed.item_exists", preview=question_content[:50])
        return None

    # Create item (without current_version_id — circular FK)
    item = Item(
        institution_id=institution_id,
        item_type="single_best_answer",
        exam_type=exam_type,
        exam_part=exam_part,
        language="fa",
        status=status,
        created_by_id=created_by_id,
    )
    db.add(item)
    await db.flush()

    # Create first version
    version = ItemVersion(
        item_id=item.id,
        version_number=1,
        content=question_content,
        explanation=explanation,
        authored_by_id=created_by_id,
        is_published=(status == "active"),
    )
    db.add(version)
    await db.flush()

    # Create options
    db.add_all(
        [
            Option(
                item_version_id=version.id,
                key=opt["key"],
                content=opt["content"],
                is_correct=opt.get("is_correct", False),
                explanation=opt.get("explanation"),
                display_order=i,
            )
            for i, opt in enumerate(options)
        ]
    )
    await db.flush()

    # Close the circular FK
    item.current_version_id = version.id

    # Link to topic
    db.add(
        ItemTopicLink(
            item_id=item.id,
            topic_id=topic.id,
            is_primary=True,
            created_by_id=created_by_id,
        )
    )
    await db.flush()

    log.info("seed.item_created", item_id=str(item.id), status=status)
    return item


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------


async def seed(db: AsyncSession) -> None:
    log.info("seed.start")

    # 1. Institution
    institution = await _get_or_create_institution(db)

    # 2. Users
    await _get_or_create_user(
        db,
        ADMIN_EMAIL,
        "زهرا محمدی",
        "Admin1234!",
        institution,
        "institution_admin",
    )
    instructor = await _get_or_create_user(
        db,
        INSTRUCTOR_EMAIL,
        "علی رضایی",
        "Teach1234!",
        institution,
        "instructor",
    )
    await _get_or_create_user(
        db,
        STUDENT_EMAIL,
        "نگار احمدی",
        "Study1234!",
        institution,
        "student",
    )

    # 3. Topic tree (demo, institution-scoped, 2 levels: درس → مبحث)
    persian = await _get_or_create_topic(
        db, "زبان و ادبیات فارسی", "demo-persian", institution.id, instructor.id
    )
    qarabat = await _get_or_create_topic(
        db, "قرابت معنایی", "demo-persian-qarabat", institution.id, instructor.id, parent=persian
    )
    math = await _get_or_create_topic(
        db, "ریاضی و آمار", "demo-math", institution.id, instructor.id
    )
    percent = await _get_or_create_topic(
        db, "درصد و نسبت", "demo-math-percent", institution.id, instructor.id, parent=math
    )

    # 4. Sample items (employment exam — education / general)
    await _create_item_if_not_exists(
        db,
        institution_id=institution.id,
        created_by_id=instructor.id,
        topic=qarabat,
        exam_type="education",
        exam_part="general",
        question_content="کدام واژه با «سعی» قرابت معنایی دارد؟",
        explanation="«سعی» به معنای تلاش و کوشش است؛ پس «کوشش» نزدیک‌ترین معنا را دارد.",
        options=[
            {"key": "A", "content": "خواهش", "is_correct": False},
            {"key": "B", "content": "کوشش", "is_correct": True,
             "explanation": "کوشش = تلاش = سعی."},
            {"key": "C", "content": "آرامش", "is_correct": False},
            {"key": "D", "content": "دانش", "is_correct": False},
        ],
        status="active",
    )

    await _create_item_if_not_exists(
        db,
        institution_id=institution.id,
        created_by_id=instructor.id,
        topic=percent,
        exam_type="education",
        exam_part="general",
        question_content="۱۵٪ از عدد ۲۴۰ چند است؟",
        explanation="۲۴۰ × ۰٫۱۵ = ۳۶.",
        options=[
            {"key": "A", "content": "۳۰", "is_correct": False},
            {"key": "B", "content": "۳۶", "is_correct": True,
             "explanation": "۱۵ درصد از ۲۴۰ می‌شود ۳۶."},
            {"key": "C", "content": "۴۰", "is_correct": False},
            {"key": "D", "content": "۲۴", "is_correct": False},
        ],
        status="active",
    )

    await _create_item_if_not_exists(
        db,
        institution_id=institution.id,
        created_by_id=instructor.id,
        topic=percent,
        exam_type="education",
        exam_part="general",
        question_content="میانگین چهار عدد ۱۰، ۲۰، ۳۰ و ۴۰ چند است؟",
        explanation="مجموع = ۱۰۰؛ میانگین = ۱۰۰ ÷ ۴ = ۲۵.",
        options=[
            {"key": "A", "content": "۲۰", "is_correct": False},
            {"key": "B", "content": "۲۵", "is_correct": True,
             "explanation": "مجموع چهار عدد ۱۰۰ است و تقسیم بر ۴ می‌شود ۲۵."},
            {"key": "C", "content": "۳۰", "is_correct": False},
            {"key": "D", "content": "۱۵", "is_correct": False},
        ],
        status="draft",
    )

    await db.commit()
    log.info("seed.complete")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(main())

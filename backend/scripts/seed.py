"""
Idempotent database seed script for development and testing.

Creates:
  1. Institution  : "Synapse Demo University"  (slug: synapse-demo)
  2. Admin user   : admin@synapse-demo.edu     / Admin1234!  (institution_admin)
  3. Instructor   : instructor@synapse-demo.edu / Teach1234! (instructor)
  4. Student      : student@synapse-demo.edu   / Study1234!  (student)
  5. Topic tree   : Basic Sciences → Physiology → Cardiovascular Physiology
                    Basic Sciences → Biochemistry
                    Clinical Sciences → Cardiology → Heart Failure
                    Clinical Sciences → Pulmonology
  6. Items (3)    : 2 published SBA questions + 1 draft

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

INSTITUTION_SLUG = "synapse-demo"
ADMIN_EMAIL = "admin@synapse-demo.edu"
INSTRUCTOR_EMAIL = "instructor@synapse-demo.edu"
STUDENT_EMAIL = "student@synapse-demo.edu"


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
        name="Synapse Demo University",
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
        "Dr. Shila Vardini",
        "Admin1234!",
        institution,
        "institution_admin",
    )
    instructor = await _get_or_create_user(
        db,
        INSTRUCTOR_EMAIL,
        "Prof. Sam Rivera",
        "Teach1234!",
        institution,
        "instructor",
    )
    await _get_or_create_user(
        db,
        STUDENT_EMAIL,
        "Jordan Lee",
        "Study1234!",
        institution,
        "student",
    )

    # 3. Topic tree
    basic = await _get_or_create_topic(
        db, "Basic Sciences", "basic-sciences", institution.id, instructor.id
    )
    physiology = await _get_or_create_topic(
        db, "Physiology", "physiology", institution.id, instructor.id, parent=basic
    )
    cardio_phys = await _get_or_create_topic(
        db,
        "Cardiovascular Physiology",
        "cardiovascular-physiology",
        institution.id,
        instructor.id,
        parent=physiology,
    )
    await _get_or_create_topic(
        db, "Biochemistry", "biochemistry", institution.id, instructor.id, parent=basic
    )

    clinical = await _get_or_create_topic(
        db, "Clinical Sciences", "clinical-sciences", institution.id, instructor.id
    )
    cardiology = await _get_or_create_topic(
        db, "Cardiology", "cardiology", institution.id, instructor.id, parent=clinical
    )
    heart_failure = await _get_or_create_topic(
        db, "Heart Failure", "heart-failure", institution.id, instructor.id, parent=cardiology
    )
    await _get_or_create_topic(
        db, "Pulmonology", "pulmonology", institution.id, instructor.id, parent=clinical
    )

    # 4. Sample items
    await _create_item_if_not_exists(
        db,
        institution_id=institution.id,
        created_by_id=instructor.id,
        topic=cardio_phys,
        question_content=(
            "The Frank-Starling mechanism states that the heart will pump out "
            "a greater volume of blood when which of the following occurs?"
        ),
        explanation=(
            "The Frank-Starling mechanism describes the relationship between "
            "end-diastolic volume (EDV) and stroke volume. As venous return increases, "
            "EDV increases, stretching the myocardial fibers and increasing the force of "
            "contraction — resulting in a larger stroke volume."
        ),
        options=[
            {
                "key": "A",
                "content": "Heart rate increases",
                "is_correct": False,
                "explanation": "Heart rate is not the primary driver of this mechanism.",
            },
            {
                "key": "B",
                "content": "Venous return to the heart increases",
                "is_correct": True,
                "explanation": "Increased venous return → increased EDV → increased stretch → increased stroke volume.",
            },
            {
                "key": "C",
                "content": "Systemic vascular resistance decreases",
                "is_correct": False,
                "explanation": "SVR affects afterload, not preload (which drives the Frank-Starling mechanism).",
            },
            {
                "key": "D",
                "content": "Sympathetic tone decreases",
                "is_correct": False,
                "explanation": "Decreased sympathetic tone would reduce contractility, the opposite effect.",
            },
        ],
        status="active",
    )

    await _create_item_if_not_exists(
        db,
        institution_id=institution.id,
        created_by_id=instructor.id,
        topic=heart_failure,
        question_content=(
            "A 68-year-old man with a history of ischemic cardiomyopathy presents with "
            "progressive dyspnea on exertion, orthopnea, and bilateral pitting edema to the knees. "
            "His ejection fraction is 30%. Which of the following best explains his edema?"
        ),
        explanation=(
            "In HFrEF, reduced cardiac output leads to decreased renal perfusion, "
            "activating the renin-angiotensin-aldosterone system (RAAS). Aldosterone causes "
            "sodium and water retention, increasing venous pressure and causing peripheral edema."
        ),
        options=[
            {
                "key": "A",
                "content": "Decreased oncotic pressure due to hypoalbuminemia",
                "is_correct": False,
                "explanation": "While hypoalbuminemia can cause edema, it is not the primary mechanism in HFrEF.",
            },
            {
                "key": "B",
                "content": "Activation of RAAS leading to sodium and water retention",
                "is_correct": True,
                "explanation": "Reduced CO → decreased renal perfusion → RAAS activation → Na+/H2O retention → edema.",
            },
            {
                "key": "C",
                "content": "Increased capillary permeability from inflammatory cytokines",
                "is_correct": False,
                "explanation": "This mechanism is more relevant to distributive states such as sepsis.",
            },
            {
                "key": "D",
                "content": "Lymphatic obstruction due to venous congestion",
                "is_correct": False,
                "explanation": "Lymphatic obstruction is not the primary cause in this scenario.",
            },
        ],
        status="active",
    )

    await _create_item_if_not_exists(
        db,
        institution_id=institution.id,
        created_by_id=instructor.id,
        topic=cardio_phys,
        question_content=(
            "Which of the following is the primary determinant of myocardial oxygen demand?"
        ),
        explanation=(
            "Myocardial oxygen demand (MVO2) is primarily determined by heart rate, "
            "contractility, and wall stress (related to afterload and preload). "
            "Heart rate has the greatest single impact because it determines both the "
            "rate of work and the rate of ATP consumption."
        ),
        options=[
            {"key": "A", "content": "Preload", "is_correct": False},
            {
                "key": "B",
                "content": "Heart rate × systolic blood pressure (rate-pressure product)",
                "is_correct": True,
                "explanation": "The double product (HR × SBP) is the best bedside estimate of MVO2.",
            },
            {"key": "C", "content": "Diastolic filling time", "is_correct": False},
            {"key": "D", "content": "Pulmonary capillary wedge pressure", "is_correct": False},
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

"""
Shared test fixtures.

Two tiers of fixtures live here:

  * ``client`` — a plain ASGI client (no DB), used by the infra/health tests.
  * ``db`` / ``seed`` / ``auth_client`` — the integration stack: a real Postgres
    connection wrapped in an outer transaction that is **rolled back** after each
    test (via ``join_transaction_mode="create_savepoint"`` so the service layer's
    own ``commit()`` calls stay inside the test's transaction). This gives full
    isolation without truncating tables between tests.

Integration fixtures ``pytest.skip`` cleanly if Postgres is unreachable, so the
pure-unit suite still runs anywhere (e.g. CI without a database).
"""

import uuid
from dataclasses import dataclass, field

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from app.api import deps
from app.api.deps import CurrentUser
from app.core.config import settings
from app.main import app
from app.models.base import Base
from app.models.institution import Institution
from app.models.item import Item
from app.models.topic import Topic
from app.models.user import User
from app.schemas.items import ItemCreate, ItemVersionCreate, OptionCreate
from app.services import item_service

# A dedicated async engine for tests. NullPool keeps connections from leaking
# across pytest-asyncio's per-test event loops.
test_engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)

_schema_ready = False


async def _ensure_schema() -> None:
    """Create all tables once (idempotent against an already-migrated DB)."""
    global _schema_ready
    if _schema_ready:
        return
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    _schema_ready = True


# ---------------------------------------------------------------------------
# Plain client (no database) — for infrastructure tests
# ---------------------------------------------------------------------------


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ---------------------------------------------------------------------------
# Transactional database session (rolled back per test)
# ---------------------------------------------------------------------------


@pytest.fixture
async def db() -> AsyncSession:
    try:
        connection = await test_engine.connect()
    except Exception as exc:  # pragma: no cover - environment dependent
        pytest.skip(f"Postgres not available for integration tests: {exc}")

    await _ensure_schema()
    trans = await connection.begin()
    session = AsyncSession(
        bind=connection,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )
    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await connection.close()


# ---------------------------------------------------------------------------
# Seed data — institution, student, 4-level topic, and a calibrated item pool
# ---------------------------------------------------------------------------


@dataclass
class Seeded:
    institution_id: uuid.UUID
    user_id: uuid.UUID
    exam_topic_id: uuid.UUID
    subject_topic_id: uuid.UUID
    domain_topic_id: uuid.UUID
    exam_type: str
    item_ids: list[uuid.UUID] = field(default_factory=list)


@pytest.fixture
async def seed(db: AsyncSession) -> Seeded:
    suffix = uuid.uuid4().hex[:8]
    exam_type = "usmle_step1"

    institution = Institution(name=f"Test Med School {suffix}", slug=f"test-{suffix}")
    db.add(institution)
    await db.flush()

    user = User(email=f"student-{suffix}@test.edu", full_name="Test Student", is_active=True)
    db.add(user)
    await db.flush()

    # 3-deep topic chain (Exam -> Subject -> Domain). Domain is the primary topic
    # questions attach to.
    exam_topic = Topic(
        institution_id=institution.id,
        name="USMLE Step 1",
        slug=f"step1-{suffix}",
        path=f"step1-{suffix}",
        level=0,
        created_by_id=user.id,
    )
    db.add(exam_topic)
    await db.flush()
    subject_topic = Topic(
        institution_id=institution.id,
        parent_id=exam_topic.id,
        name="Cardiology",
        slug=f"cardio-{suffix}",
        path=f"step1-{suffix}/cardio-{suffix}",
        level=1,
        created_by_id=user.id,
    )
    db.add(subject_topic)
    await db.flush()
    domain_topic = Topic(
        institution_id=institution.id,
        parent_id=subject_topic.id,
        name="Arrhythmias",
        slug=f"arrhythmia-{suffix}",
        path=f"step1-{suffix}/cardio-{suffix}/arrhythmia-{suffix}",
        level=2,
        created_by_id=user.id,
    )
    db.add(domain_topic)
    await db.flush()

    seeded = Seeded(
        institution_id=institution.id,
        user_id=user.id,
        exam_topic_id=exam_topic.id,
        subject_topic_id=subject_topic.id,
        domain_topic_id=domain_topic.id,
        exam_type=exam_type,
    )

    # A spread of difficulties so adaptive selection has meaningful choices.
    # difficulty_preset maps to irt_b: 1->-2, 2->-1, 3->0, 4->1, 5->2.
    for n, preset in enumerate((1, 2, 3, 3, 4, 5)):
        data = ItemCreate(
            item_type="single_best_answer",
            exam_type=exam_type,
            topic_ids=[domain_topic.id],
            primary_topic_id=domain_topic.id,
            difficulty_preset=preset,
            version=ItemVersionCreate(
                content=f"Question {n}: which finding is most consistent with the diagnosis?",
                explanation="Reference explanation.",
                options=[
                    OptionCreate(key="A", content="Correct choice", is_correct=True, display_order=0),
                    OptionCreate(key="B", content="Distractor B", is_correct=False, display_order=1),
                    OptionCreate(key="C", content="Distractor C", is_correct=False, display_order=2),
                    OptionCreate(key="D", content="Distractor D", is_correct=False, display_order=3),
                ],
            ),
        )
        item = await item_service.create_item(
            db, data=data, institution_id=institution.id, created_by_id=user.id
        )
        seeded.item_ids.append(item.id)

    # Items are created as drafts; activate them so they enter the candidate pool.
    await db.execute(
        update(Item)
        .where(Item.id.in_(seeded.item_ids))
        .values(status="active")
    )
    await db.commit()
    return seeded


# ---------------------------------------------------------------------------
# Authenticated client — overrides DB + current-user dependencies
# ---------------------------------------------------------------------------


@pytest.fixture
async def auth_client(db: AsyncSession, seed: Seeded) -> AsyncClient:
    async def _override_get_db():
        yield db

    async def _override_current_user() -> CurrentUser:
        return CurrentUser(
            user_id=seed.user_id,
            session_id=uuid.uuid4(),
            institution_id=seed.institution_id,
            role="student",
            email="student@test.edu",
            full_name="Test Student",
        )

    app.dependency_overrides[deps.get_db] = _override_get_db
    app.dependency_overrides[deps.get_current_user] = _override_current_user
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            yield c
    finally:
        app.dependency_overrides.clear()

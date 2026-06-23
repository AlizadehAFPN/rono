"""
Integration tests for open student self-registration (`POST /api/v1/auth/signup`).

Unlike `/auth/register` (which provisions a brand-new institution + admin), the
signup path must enrol a **student** into the single existing institution and log
them straight in — without creating a new tenant. These run against a real
Postgres in a rolled-back transaction (see conftest) and skip if it is absent.
"""

import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from app.api import deps
from app.main import app
from app.models.institution import Institution
from app.models.membership import Membership
from app.models.user import User

pytestmark = pytest.mark.asyncio


@pytest.fixture
async def anon_client(db):
    """Unauthenticated client sharing the test's transactional session.

    Guarantees at least one institution exists (without the heavier `seed`
    fixture / item pool) so signup has a tenant to land in.
    """
    existing = await db.scalar(select(Institution).limit(1))
    if existing is None:
        suffix = uuid.uuid4().hex[:8]
        db.add(Institution(name=f"Signup Test University {suffix}", slug=f"signup-{suffix}"))
        await db.flush()

    async def _override_get_db():
        yield db

    app.dependency_overrides[deps.get_db] = _override_get_db
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            yield c
    finally:
        app.dependency_overrides.clear()


def _signup_body(**over):
    suffix = uuid.uuid4().hex[:10]
    return {
        "email": f"self-signup-{suffix}@example.com",
        "password": "anything-goes",
        "full_name": "Self Registrant",
        **over,
    }


async def test_signup_creates_active_student_and_logs_in(anon_client, db):
    inst_before = await db.scalar(select(func.count()).select_from(Institution))

    body = _signup_body()
    resp = await anon_client.post("/api/v1/auth/signup", json=body)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    # Logged straight in: returned profile + a single active student membership.
    assert data["user"]["email"] == body["email"]
    assert data["user"]["is_active"] is True
    assert len(data["memberships"]) == 1
    assert data["memberships"][0]["role"] == "student"
    assert data["memberships"][0]["status"] == "active"

    # Same httpOnly auth cookies as login.
    assert "access_token" in resp.cookies
    assert "refresh_token" in resp.cookies

    # No new institution was created — the student joined the existing tenant.
    inst_after = await db.scalar(select(func.count()).select_from(Institution))
    assert inst_after == inst_before

    # Membership points at a real, existing institution.
    membership = await db.scalar(
        select(Membership).where(Membership.user_id == uuid.UUID(data["user"]["id"]))
    )
    assert membership is not None
    institution = await db.scalar(
        select(Institution).where(Institution.id == membership.institution_id)
    )
    assert institution is not None

    # Password was hashed, never stored in plaintext.
    user = await db.scalar(select(User).where(User.id == uuid.UUID(data["user"]["id"])))
    assert user.hashed_password is not None
    assert user.hashed_password != body["password"]


async def test_signup_rejects_duplicate_email(anon_client):
    body = _signup_body()
    first = await anon_client.post("/api/v1/auth/signup", json=body)
    assert first.status_code == 201, first.text

    dupe = await anon_client.post("/api/v1/auth/signup", json=body)
    assert dupe.status_code == 409, dupe.text


async def test_signup_rejects_invalid_email_and_empty_fields(anon_client):
    assert (
        await anon_client.post(
            "/api/v1/auth/signup", json=_signup_body(email="not-an-email")
        )
    ).status_code == 422
    assert (
        await anon_client.post("/api/v1/auth/signup", json=_signup_body(password=""))
    ).status_code == 422
    assert (
        await anon_client.post("/api/v1/auth/signup", json=_signup_body(full_name="  "))
    ).status_code == 422


async def test_signup_then_login_resolves_same_student(anon_client, db):
    body = _signup_body()
    assert (await anon_client.post("/api/v1/auth/signup", json=body)).status_code == 201

    login = await anon_client.post(
        "/api/v1/auth/login",
        json={"email": body["email"], "password": body["password"]},
    )
    assert login.status_code == 200, login.text
    data = login.json()
    assert data["memberships"][0]["role"] == "student"
    assert "access_token" in login.cookies

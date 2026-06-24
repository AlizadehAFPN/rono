"""
FastAPI dependency injection layer.

All request-scoped objects (database sessions, current user) are resolved here.
Nothing in this file performs business logic — it purely extracts, validates, and
delivers trusted objects to endpoint handlers.
"""

import uuid
from collections.abc import AsyncGenerator
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.exceptions import ForbiddenError, InvalidTokenError, UnauthorizedError
from app.core.roles import role_gte
from app.core.security import decode_token
from app.models.auth_session import AuthSession
from app.models.user import User

# ---------------------------------------------------------------------------
# Database session dependency
# ---------------------------------------------------------------------------


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Current user context — passed through all authenticated endpoints
# ---------------------------------------------------------------------------


@dataclass
class CurrentUser:
    user_id: uuid.UUID
    session_id: uuid.UUID
    institution_id: uuid.UUID | None  # None only for system_admin acting globally
    role: str
    email: str
    full_name: str | None


# ---------------------------------------------------------------------------
# Authentication dependency
# ---------------------------------------------------------------------------


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    """
    1. Read access_token cookie.
    2. Decode + verify JWT signature and expiry.
    3. Confirm token type is "access" (not refresh).
    4. Validate session exists in DB (not revoked, not expired).
    5. Validate user exists and is active.
    6. Return CurrentUser populated from both JWT and DB.

    Two DB queries per request is intentional: it allows immediate session
    revocation (e.g., admin suspends a user) without waiting for JWT expiry.
    A Redis cache layer can be added in Phase 3 to amortise the cost.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise UnauthorizedError("Authentication required.")

    # Raises InvalidTokenError (subclass of RonoException → 401) on any JWT failure
    try:
        payload = decode_token(token)
    except InvalidTokenError as err:
        raise UnauthorizedError("Session is invalid or expired. Please log in again.") from err

    if payload.type != "access":
        raise UnauthorizedError("Invalid token type.")

    session_id = uuid.UUID(payload.jti)
    user_id = uuid.UUID(payload.sub)
    now = datetime.now(UTC)

    # --- Session validation ---
    result = await db.execute(
        select(AuthSession).where(
            AuthSession.id == session_id,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
    )
    auth_session = result.scalar_one_or_none()
    if auth_session is None:
        raise UnauthorizedError("Session has expired or been revoked. Please log in again.")

    # --- User validation ---
    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.is_active.is_(True),
            User.deleted_at.is_(None),
        )
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedError("Account not found or has been deactivated.")

    institution_id = uuid.UUID(payload.institution_id) if payload.institution_id else None

    return CurrentUser(
        user_id=user_id,
        session_id=session_id,
        institution_id=institution_id,
        role=payload.role,
        email=user.email,
        full_name=user.full_name,
    )


# ---------------------------------------------------------------------------
# Role-gating dependency factory
# ---------------------------------------------------------------------------


def require_role(minimum_role: str):
    """
    Factory that returns a FastAPI dependency enforcing a minimum role.

    Usage:
        @router.post("/topics")
        async def create_topic(
            current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
        ): ...
    """

    async def _check(
        current_user: Annotated[CurrentUser, Depends(get_current_user)],
    ) -> CurrentUser:
        if not role_gte(current_user.role, minimum_role):
            raise ForbiddenError(
                f"This action requires '{minimum_role}' role or higher. "
                f"Your current role is '{current_user.role}'."
            )
        return current_user

    return _check

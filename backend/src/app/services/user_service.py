"""Institution user management — list, create, update members."""

import uuid

from sqlalchemy import func, select
from sqlalchemy import update as sql_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.core.roles import ROLE_HIERARCHY
from app.core.security import hash_password
from app.models.membership import Membership
from app.models.user import User
from app.schemas.users import UserCreate, UserListItem, UserUpdate


def _validate_role(role: str) -> None:
    if role not in ROLE_HIERARCHY:
        raise BadRequestError(f"Unknown role '{role}'.")


async def list_users(
    db: AsyncSession,
    institution_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[UserListItem], int]:
    base = (
        select(User, Membership.role, Membership.status)
        .join(Membership, Membership.user_id == User.id)
        .where(Membership.institution_id == institution_id, User.deleted_at.is_(None))
    )
    total = (
        await db.execute(select(func.count()).select_from(base.subquery()))
    ).scalar_one()
    rows = (
        await db.execute(base.order_by(User.created_at.desc()).limit(limit).offset(offset))
    ).all()
    users = [
        UserListItem(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=role,
            status=status,
            is_active=u.is_active,
            last_login_at=u.last_login_at,
            created_at=u.created_at,
        )
        for (u, role, status) in rows
    ]
    return users, total


async def create_user(
    db: AsyncSession,
    institution_id: uuid.UUID,
    data: UserCreate,
    invited_by_id: uuid.UUID,
) -> UserListItem:
    _validate_role(data.role)
    email = data.email.strip().lower()
    if not email or "@" not in email:
        raise BadRequestError("A valid email is required.")
    if len(data.password) < 8:
        raise BadRequestError("Password must be at least 8 characters.")

    existing = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if existing is not None:
        raise BadRequestError("A user with this email already exists.")

    user = User(
        email=email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        is_active=True,
    )
    db.add(user)
    await db.flush()

    db.add(
        Membership(
            user_id=user.id,
            institution_id=institution_id,
            role=data.role,
            status="active",
            invited_by_id=invited_by_id,
        )
    )
    await db.commit()

    return UserListItem(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=data.role,
        status="active",
        is_active=True,
        last_login_at=None,
        created_at=user.created_at,
    )


async def update_user(
    db: AsyncSession,
    institution_id: uuid.UUID,
    user_id: uuid.UUID,
    data: UserUpdate,
) -> UserListItem:
    membership = (
        await db.execute(
            select(Membership).where(
                Membership.user_id == user_id,
                Membership.institution_id == institution_id,
            )
        )
    ).scalar_one_or_none()
    if membership is None:
        raise NotFoundError("User not found in this institution.")

    if data.role is not None:
        _validate_role(data.role)
        membership.role = data.role
    if data.status is not None:
        membership.status = data.status
    if data.is_active is not None:
        await db.execute(
            sql_update(User).where(User.id == user_id).values(is_active=data.is_active)
        )

    await db.commit()

    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one()
    return UserListItem(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=membership.role,
        status=membership.status,
        is_active=user.is_active,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
    )

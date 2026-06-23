"""Institution user management endpoints (admin only)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db, require_role
from app.core.exceptions import ForbiddenError
from app.core.roles import Role
from app.schemas.users import PaginatedUsers, UserCreate, UserListItem, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])

AdminDep = Annotated[CurrentUser, Depends(require_role(Role.INSTITUTION_ADMIN))]


def _institution(current_user: CurrentUser) -> uuid.UUID:
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")
    return current_user.institution_id


@router.get("", response_model=PaginatedUsers, include_in_schema=False)
@router.get("/", response_model=PaginatedUsers)
async def list_users(
    current_user: AdminDep,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> PaginatedUsers:
    users, total = await user_service.list_users(
        db, _institution(current_user), limit=limit, offset=offset
    )
    return PaginatedUsers(users=users, total=total, limit=limit, offset=offset)


@router.post("", response_model=UserListItem, status_code=201, include_in_schema=False)
@router.post("/", response_model=UserListItem, status_code=201)
async def create_user(
    data: UserCreate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
) -> UserListItem:
    return await user_service.create_user(
        db, _institution(current_user), data, invited_by_id=current_user.user_id
    )


@router.patch("/{user_id}", response_model=UserListItem)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
) -> UserListItem:
    return await user_service.update_user(db, _institution(current_user), user_id, data)

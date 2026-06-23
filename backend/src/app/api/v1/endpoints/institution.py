"""Institution settings endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, get_db, require_role
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.roles import Role
from app.models.institution import Institution
from app.schemas.institution import InstitutionOut, InstitutionUpdate

router = APIRouter(prefix="/institution", tags=["Institution"])

CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
AdminDep = Annotated[CurrentUser, Depends(require_role(Role.INSTITUTION_ADMIN))]


async def _load(db: AsyncSession, current_user: CurrentUser) -> Institution:
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")
    inst = (
        await db.execute(
            select(Institution).where(Institution.id == current_user.institution_id)
        )
    ).scalar_one_or_none()
    if inst is None:
        raise NotFoundError("Institution not found.")
    return inst


@router.get("", response_model=InstitutionOut, include_in_schema=False)
@router.get("/", response_model=InstitutionOut)
async def get_institution(
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> InstitutionOut:
    return InstitutionOut.model_validate(await _load(db, current_user))


@router.patch("", response_model=InstitutionOut, include_in_schema=False)
@router.patch("/", response_model=InstitutionOut)
async def update_institution(
    data: InstitutionUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
) -> InstitutionOut:
    inst = await _load(db, current_user)
    if data.name is not None:
        inst.name = data.name
    if data.domain is not None:
        inst.domain = data.domain or None
    await db.commit()
    await db.refresh(inst)
    return InstitutionOut.model_validate(inst)

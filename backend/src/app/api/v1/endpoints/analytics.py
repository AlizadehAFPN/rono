"""Analytics & reporting endpoints (instructor+)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db, require_role
from app.core.exceptions import ForbiddenError
from app.core.roles import Role
from app.models.item import Item
from app.models.item_version import ItemVersion
from app.models.membership import Membership
from app.models.practice_session import PracticeSession
from app.models.response import Response
from app.schemas.analytics import AnalyticsOverview, ItemStat, ItemStatsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])

InstructorDep = Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))]


def _institution(current_user: CurrentUser) -> uuid.UUID:
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")
    return current_user.institution_id


@router.get("/overview", response_model=AnalyticsOverview)
async def overview(
    current_user: InstructorDep,
    db: AsyncSession = Depends(get_db),
) -> AnalyticsOverview:
    inst = _institution(current_user)

    total_items = (
        await db.execute(
            select(func.count())
            .select_from(Item)
            .where(Item.institution_id == inst, Item.deleted_at.is_(None))
        )
    ).scalar_one()
    active_items = (
        await db.execute(
            select(func.count())
            .select_from(Item)
            .where(
                Item.institution_id == inst,
                Item.deleted_at.is_(None),
                Item.status == "active",
            )
        )
    ).scalar_one()
    total_responses = (
        await db.execute(
            select(func.count())
            .select_from(Response)
            .where(Response.institution_id == inst, Response.is_correct.is_not(None))
        )
    ).scalar_one()
    total_correct = (
        await db.execute(
            select(func.count())
            .select_from(Response)
            .where(Response.institution_id == inst, Response.is_correct.is_(True))
        )
    ).scalar_one()
    total_users = (
        await db.execute(
            select(func.count())
            .select_from(Membership)
            .where(Membership.institution_id == inst)
        )
    ).scalar_one()
    completed_sessions = (
        await db.execute(
            select(func.count())
            .select_from(PracticeSession)
            .where(
                PracticeSession.institution_id == inst,
                PracticeSession.status == "completed",
            )
        )
    ).scalar_one()

    return AnalyticsOverview(
        total_items=total_items,
        active_items=active_items,
        total_responses=total_responses,
        overall_accuracy=(total_correct / total_responses if total_responses else None),
        total_users=total_users,
        completed_sessions=completed_sessions,
    )


@router.get("/items", response_model=ItemStatsResponse)
async def item_stats(
    current_user: InstructorDep,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> ItemStatsResponse:
    inst = _institution(current_user)

    resp = (
        select(
            Response.item_id.label("item_id"),
            func.count().label("n"),
            func.count().filter(Response.is_correct.is_(True)).label("correct"),
        )
        .where(Response.institution_id == inst, Response.is_correct.is_not(None))
        .group_by(Response.item_id)
        .subquery()
    )

    stmt = (
        select(
            Item.id,
            ItemVersion.content,
            Item.exam_type,
            Item.exam_part,
            Item.irt_b,
            Item.calibration_status,
            func.coalesce(resp.c.n, 0),
            func.coalesce(resp.c.correct, 0),
        )
        .join(ItemVersion, ItemVersion.id == Item.current_version_id, isouter=True)
        .join(resp, resp.c.item_id == Item.id, isouter=True)
        .where(Item.institution_id == inst, Item.deleted_at.is_(None))
        .order_by(func.coalesce(resp.c.n, 0).desc())
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()

    items = []
    for (iid, content, exam_type, exam_part, irt_b, calib, n, correct) in rows:
        preview = (content or "")[:90]
        items.append(
            ItemStat(
                item_id=iid,
                preview=preview,
                exam_type=exam_type,
                exam_part=exam_part,
                irt_b=float(irt_b) if irt_b is not None else None,
                calibration_status=calib,
                response_count=n,
                accuracy=(correct / n if n else None),
            )
        )
    return ItemStatsResponse(items=items)

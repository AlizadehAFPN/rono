"""
Topics endpoints.

Topics are scoped to the authenticated user's institution.
Read access: any authenticated user (student, instructor, admin).
Write access: instructor or higher.
Delete (deactivate): institution_admin or higher.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, get_db, require_role
from app.core.roles import Role
from app.schemas.topics import TopicCreate, TopicOut, TopicTree, TopicUpdate
from app.services import topic_service

router = APIRouter(prefix="/topics", tags=["Topics"])


# ---------------------------------------------------------------------------
# GET /topics  — list (flat)
# ---------------------------------------------------------------------------


@router.get("", response_model=list[TopicOut], include_in_schema=False)
@router.get("/", response_model=list[TopicOut])
async def list_topics(
    parent_id: uuid.UUID | None = Query(None, description="Filter by parent topic ID"),
    include_inactive: bool = Query(False, description="Include deactivated topics"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TopicOut]:
    """List topics for the authenticated user's institution (flat, paginated)."""
    topics = await topic_service.list_topics(
        db,
        institution_id=current_user.institution_id,
        parent_id=parent_id,
        include_inactive=include_inactive,
        limit=limit,
        offset=offset,
    )
    return [TopicOut.model_validate(t) for t in topics]


# ---------------------------------------------------------------------------
# GET /topics/tree — nested tree
# ---------------------------------------------------------------------------


@router.get("/tree", response_model=list[TopicTree])
async def topic_tree(
    root_id: uuid.UUID | None = Query(
        None, description="Start tree from this topic (default: all roots)"
    ),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TopicTree]:
    """Return the full topic hierarchy as a nested tree."""
    return await topic_service.get_topic_tree(
        db,
        institution_id=current_user.institution_id,
        root_id=root_id,
    )


# ---------------------------------------------------------------------------
# POST /topics — create
# ---------------------------------------------------------------------------


@router.post("", response_model=TopicOut, status_code=201, include_in_schema=False)
@router.post("/", response_model=TopicOut, status_code=201)
async def create_topic(
    data: TopicCreate,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
    db: AsyncSession = Depends(get_db),
) -> TopicOut:
    """Create a new topic. Requires instructor role or higher."""
    topic = await topic_service.create_topic(
        db,
        data=data,
        institution_id=current_user.institution_id,
        created_by_id=current_user.user_id,
    )
    return TopicOut.model_validate(topic)


# ---------------------------------------------------------------------------
# GET /topics/{topic_id}
# ---------------------------------------------------------------------------


@router.get("/{topic_id}", response_model=TopicOut)
async def get_topic(
    topic_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TopicOut:
    """Fetch a single topic by ID."""
    topic = await topic_service.get_topic(
        db,
        topic_id=topic_id,
        institution_id=current_user.institution_id,
    )
    return TopicOut.model_validate(topic)


# ---------------------------------------------------------------------------
# PATCH /topics/{topic_id}
# ---------------------------------------------------------------------------


@router.patch("/{topic_id}", response_model=TopicOut)
async def update_topic(
    topic_id: uuid.UUID,
    data: TopicUpdate,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
    db: AsyncSession = Depends(get_db),
) -> TopicOut:
    """Update a topic's name, slug, description, display order, or active status."""
    topic = await topic_service.update_topic(
        db,
        topic_id=topic_id,
        data=data,
        institution_id=current_user.institution_id,
    )
    return TopicOut.model_validate(topic)


# ---------------------------------------------------------------------------
# DELETE /topics/{topic_id} — soft delete (sets is_active=False)
# ---------------------------------------------------------------------------


@router.delete("/{topic_id}", status_code=204)
async def delete_topic(
    topic_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTITUTION_ADMIN))],
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Deactivate a topic (soft delete — sets is_active=False).
    Fails if any items are still linked to this topic.
    Requires institution_admin role.
    """
    await topic_service.delete_topic(
        db,
        topic_id=topic_id,
        institution_id=current_user.institution_id,
    )

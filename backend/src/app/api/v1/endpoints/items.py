"""
Items endpoints.

An item is a question. Creating an item atomically creates:
  - the Item record (metadata + IRT fields)
  - the first ItemVersion (the question text + explanation)
  - the answer Options (belonging to the version, not the item)
  - ItemTopicLink records (topic associations)

Read access: any authenticated user.
Write access: instructor or higher.
Delete (soft): instructor or higher.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, get_db, require_role
from app.core.exceptions import ForbiddenError
from app.core.roles import Role
from app.core.storage import save_question_image_file
from app.schemas.items import (
    ItemCreate,
    ItemOut,
    ItemUpdate,
    ItemVersionCreate,
    ItemVersionOut,
    ItemWithTopics,
    PaginatedItems,
    QuestionImageOut,
)
from app.services import item_service
from app.services.item_service import to_item_with_topics

router = APIRouter(prefix="/items", tags=["Items"])


# ---------------------------------------------------------------------------
# POST /items/images — upload a question image (web/PWA), returns its URL
# ---------------------------------------------------------------------------


@router.post("/images", response_model=QuestionImageOut, status_code=201)
async def upload_question_image(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(require_role(Role.INSTRUCTOR)),
    db: AsyncSession = Depends(get_db),
) -> QuestionImageOut:
    """Validate and store an image for a question, returning its public URL.

    The client puts the returned URL into the item version's media_attachments
    when it saves the item. Requires instructor role or higher.
    """
    contents = await file.read()
    url = save_question_image_file(contents)
    return QuestionImageOut(url=url)


# ---------------------------------------------------------------------------
# POST /items — create item + version + options atomically
# ---------------------------------------------------------------------------


@router.post("", response_model=ItemWithTopics, status_code=201, include_in_schema=False)
@router.post("/", response_model=ItemWithTopics, status_code=201)
async def create_item(
    data: ItemCreate,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
    db: AsyncSession = Depends(get_db),
) -> ItemWithTopics:
    """
    Create a new question with its first version and answer options.
    All created in a single atomic transaction.
    Requires instructor role or higher.
    """
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required to create items.")

    item = await item_service.create_item(
        db,
        data=data,
        institution_id=current_user.institution_id,
        created_by_id=current_user.user_id,
    )
    return to_item_with_topics(item)


# ---------------------------------------------------------------------------
# GET /items — list with filters + pagination
# ---------------------------------------------------------------------------


@router.get("", response_model=PaginatedItems, include_in_schema=False)
@router.get("/", response_model=PaginatedItems)
async def list_items(
    status: str | None = Query(None, description="Filter by status: draft, active, retired"),
    topic_id: uuid.UUID | None = Query(None, description="Filter items linked to this topic"),
    item_type: str | None = Query(None, description="Filter by item type"),
    exam_type: str | None = Query(
        None, description="Filter by exam: executive | education | bank | social_security"
    ),
    exam_part: str | None = Query(
        None, description="Filter by exam section: general | specialized"
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedItems:
    """List items for the current institution with optional filters."""
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")

    items, total = await item_service.list_items(
        db,
        institution_id=current_user.institution_id,
        status=status,
        topic_id=topic_id,
        item_type=item_type,
        exam_type=exam_type,
        exam_part=exam_part,
        limit=limit,
        offset=offset,
    )
    return PaginatedItems(
        items=[ItemOut.model_validate(i) for i in items],
        total=total,
        limit=limit,
        offset=offset,
    )


# ---------------------------------------------------------------------------
# GET /items/{item_id}
# ---------------------------------------------------------------------------


@router.get("/{item_id}", response_model=ItemWithTopics)
async def get_item(
    item_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ItemWithTopics:
    """Fetch a single item with its current version, options, and topic links."""
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")

    item = await item_service.get_item(db, item_id, current_user.institution_id)
    return to_item_with_topics(item)


# ---------------------------------------------------------------------------
# PATCH /items/{item_id}
# ---------------------------------------------------------------------------


@router.patch("/{item_id}", response_model=ItemWithTopics)
async def update_item(
    item_id: uuid.UUID,
    data: ItemUpdate,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
    db: AsyncSession = Depends(get_db),
) -> ItemWithTopics:
    """Update item status and/or topic associations.

    Does NOT change question content — create a new version for that.
    """
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")

    item = await item_service.update_item(
        db,
        item_id=item_id,
        data=data,
        institution_id=current_user.institution_id,
    )
    return to_item_with_topics(item)


# ---------------------------------------------------------------------------
# DELETE /items/{item_id} — soft delete
# ---------------------------------------------------------------------------


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Soft-delete an item (sets deleted_at). The item is hidden from all queries."""
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")

    await item_service.soft_delete_item(db, item_id, current_user.institution_id)


# ---------------------------------------------------------------------------
# POST /items/{item_id}/versions — create a new version of an existing item
# ---------------------------------------------------------------------------


@router.post("/{item_id}/versions", response_model=ItemVersionOut, status_code=201)
async def create_version(
    item_id: uuid.UUID,
    data: ItemVersionCreate,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.INSTRUCTOR))],
    db: AsyncSession = Depends(get_db),
) -> ItemVersionOut:
    """
    Create a new version of an existing item.
    The new version becomes the current version immediately.
    Old versions are retained for historical accuracy.
    """
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")

    version = await item_service.create_item_version(
        db,
        item_id=item_id,
        data=data,
        institution_id=current_user.institution_id,
        authored_by_id=current_user.user_id,
    )
    return ItemVersionOut.model_validate(version)


# ---------------------------------------------------------------------------
# GET /items/{item_id}/versions — list all versions
# ---------------------------------------------------------------------------


@router.get("/{item_id}/versions", response_model=list[ItemVersionOut])
async def list_versions(
    item_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ItemVersionOut]:
    """List all versions of an item in reverse chronological order."""
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required.")

    versions = await item_service.list_item_versions(
        db,
        item_id=item_id,
        institution_id=current_user.institution_id,
    )
    return [ItemVersionOut.model_validate(v) for v in versions]

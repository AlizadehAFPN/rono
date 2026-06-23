"""
Item service layer.

Critical note on the circular FK between items ↔ item_versions:
  - Item.current_version_id → item_versions.id (deferred with use_alter=True)
  - ItemVersion.item_id → items.id

Create order MUST be:
  1. INSERT Item (current_version_id=NULL — nullable)
  2. flush → gets item.id into the DB
  3. INSERT ItemVersion (item_id=item.id)
  4. flush → gets version.id into the DB
  5. INSERT Options (item_version_id=version.id)
  6. flush
  7. UPDATE item.current_version_id = version.id
  8. flush → satisfies the deferred FK
  9. INSERT ItemTopicLinks
  10. commit

Any deviation causes FK violations.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import delete, func, select
from sqlalchemy import update as sql_update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models.item import Item
from app.models.item_topic_link import ItemTopicLink
from app.models.item_version import ItemVersion
from app.models.option import Option
from app.schemas.items import ItemCreate, ItemUpdate, ItemVersionCreate, ItemWithTopics

# ---------------------------------------------------------------------------
# Internal loader — always use this to fetch items with full eager loads
# ---------------------------------------------------------------------------


async def _load_item(
    db: AsyncSession,
    item_id: uuid.UUID,
    institution_id: uuid.UUID | None = None,
    include_deleted: bool = False,
) -> Item:
    stmt = (
        select(Item)
        .options(
            selectinload(Item.current_version).selectinload(ItemVersion.options),
            selectinload(Item.item_topic_links),
        )
        .where(Item.id == item_id)
    )
    if institution_id is not None:
        stmt = stmt.where(Item.institution_id == institution_id)
    if not include_deleted:
        stmt = stmt.where(Item.deleted_at.is_(None))

    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if item is None:
        raise NotFoundError(f"Item '{item_id}' not found.")
    return item


# ---------------------------------------------------------------------------
# Helper: convert loaded ORM Item to ItemWithTopics schema
# ---------------------------------------------------------------------------


def to_item_with_topics(item: Item) -> ItemWithTopics:
    """
    Build ItemWithTopics from an Item that has item_topic_links eagerly loaded.
    topic_ids and primary_topic_id are derived from the link table, not stored on Item.
    """
    from app.schemas.items import ItemOut

    base = ItemOut.model_validate(item)
    links = item.item_topic_links or []
    return ItemWithTopics(
        **base.model_dump(),
        topic_ids=[lnk.topic_id for lnk in links],
        primary_topic_id=next((lnk.topic_id for lnk in links if lnk.is_primary), None),
    )


# ---------------------------------------------------------------------------
# Create item — handles the circular FK with sequential flushes
# ---------------------------------------------------------------------------


async def create_item(
    db: AsyncSession,
    data: ItemCreate,
    institution_id: uuid.UUID,
    created_by_id: uuid.UUID,
) -> Item:
    _PRESET_TO_IRT_B = {1: -2.0, 2: -1.0, 3: 0.0, 4: 1.0, 5: 2.0}

    # Step 1: Item without current_version_id (column is nullable, FK deferred via use_alter)
    item = Item(
        institution_id=institution_id,
        item_type=data.item_type,
        exam_type=data.exam_type,
        exam_part=data.exam_part,
        language=data.language,
        source=data.source,
        source_reference=data.source_reference,
        exam_year=data.exam_year,
        exam_session=data.exam_session,
        status="draft",
        created_by_id=created_by_id,
        irt_a=1.0 if data.difficulty_preset is not None else None,
        irt_b=_PRESET_TO_IRT_B.get(data.difficulty_preset, 0.0)
        if data.difficulty_preset is not None
        else None,
        calibration_status="pre_set" if data.difficulty_preset is not None else "uncalibrated",
    )
    db.add(item)
    await db.flush()  # item.id now exists in the DB transaction

    # Step 2: ItemVersion referencing the item we just flushed
    version = ItemVersion(
        item_id=item.id,
        version_number=1,
        content=data.version.content,
        explanation=data.version.explanation,
        media_attachments=data.version.media_attachments or [],
        change_summary=data.version.change_summary,
        authored_by_id=created_by_id,
    )
    db.add(version)
    await db.flush()  # version.id now exists in the DB transaction

    # Step 3: Options referencing the version
    options = [
        Option(
            item_version_id=version.id,
            key=opt.key,
            content=opt.content,
            is_correct=opt.is_correct,
            explanation=opt.explanation,
            display_order=opt.display_order,
        )
        for opt in data.version.options
    ]
    db.add_all(options)
    await db.flush()

    # Step 4: Close the circular reference — item now points to its first version
    item.current_version_id = version.id
    await db.flush()

    # Step 5: Topic links
    primary_topic_id = data.primary_topic_id or (data.topic_ids[0] if data.topic_ids else None)
    if data.topic_ids:
        db.add_all(
            [
                ItemTopicLink(
                    item_id=item.id,
                    topic_id=tid,
                    is_primary=(tid == primary_topic_id),
                    created_by_id=created_by_id,
                )
                for tid in data.topic_ids
            ]
        )

    await db.commit()

    # Reload with full eager loads for response serialization
    return await _load_item(db, item.id, institution_id)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------


async def get_item(
    db: AsyncSession,
    item_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> Item:
    return await _load_item(db, item_id, institution_id)


async def list_items(
    db: AsyncSession,
    institution_id: uuid.UUID,
    status: str | None = None,
    topic_id: uuid.UUID | None = None,
    item_type: str | None = None,
    exam_type: str | None = None,
    exam_part: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Item], int]:
    base_stmt = select(Item).where(
        Item.institution_id == institution_id,
        Item.deleted_at.is_(None),
    )
    if status:
        base_stmt = base_stmt.where(Item.status == status)
    if item_type:
        base_stmt = base_stmt.where(Item.item_type == item_type)
    if exam_type:
        base_stmt = base_stmt.where(Item.exam_type == exam_type)
    if exam_part:
        base_stmt = base_stmt.where(Item.exam_part == exam_part)
    if topic_id:
        base_stmt = base_stmt.join(
            ItemTopicLink,
            (ItemTopicLink.item_id == Item.id) & (ItemTopicLink.topic_id == topic_id),
        )

    # Total count (reuse base query structure)
    count_result = await db.execute(select(func.count()).select_from(base_stmt.subquery()))
    total = count_result.scalar_one()

    # Paginated items with eager loads
    data_stmt = (
        base_stmt.options(
            selectinload(Item.current_version).selectinload(ItemVersion.options),
            selectinload(Item.item_topic_links),
        )
        .order_by(Item.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(data_stmt)
    items = list(result.scalars().unique().all())

    return items, total


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


async def update_item(
    db: AsyncSession,
    item_id: uuid.UUID,
    data: ItemUpdate,
    institution_id: uuid.UUID,
) -> Item:
    # Verify the item exists and belongs to this institution before any writes
    await _load_item(db, item_id, institution_id)

    _PRESET_TO_IRT_B = {1: -2.0, 2: -1.0, 3: 0.0, 4: 1.0, 5: 2.0}

    # Build a flat dict of scalar column updates.
    # We use a direct SQL UPDATE (not ORM attribute mutation) because SQLAlchemy's
    # async session does not reliably track changes on Numeric columns via the ORM UoW.
    item_values: dict = {}
    if data.status is not None:
        item_values["status"] = data.status
    if data.exam_type is not None:
        item_values["exam_type"] = data.exam_type
    if data.exam_part is not None:
        item_values["exam_part"] = data.exam_part
    if data.language is not None:
        item_values["language"] = data.language
    if data.source is not None:
        item_values["source"] = data.source
    if data.source_reference is not None:
        item_values["source_reference"] = data.source_reference
    if data.exam_year is not None:
        item_values["exam_year"] = data.exam_year
    if data.exam_session is not None:
        item_values["exam_session"] = data.exam_session
    if data.difficulty_preset is not None:
        item_values["irt_a"] = 1.0
        item_values["irt_b"] = _PRESET_TO_IRT_B.get(data.difficulty_preset, 0.0)
        item_values["calibration_status"] = "pre_set"

    if item_values:
        await db.execute(
            sql_update(Item)
            .where(Item.id == item_id, Item.institution_id == institution_id)
            .values(**item_values)
        )

    if data.topic_ids is not None:
        # Replace all topic links atomically
        await db.execute(delete(ItemTopicLink).where(ItemTopicLink.item_id == item_id))
        primary_id = data.primary_topic_id or (data.topic_ids[0] if data.topic_ids else None)
        if data.topic_ids:
            db.add_all(
                [
                    ItemTopicLink(
                        item_id=item_id,
                        topic_id=tid,
                        is_primary=(tid == primary_id),
                    )
                    for tid in data.topic_ids
                ]
            )

    await db.commit()
    return await _load_item(db, item_id, institution_id)


async def soft_delete_item(
    db: AsyncSession,
    item_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> None:
    result = await db.execute(
        select(Item).where(
            Item.id == item_id,
            Item.institution_id == institution_id,
            Item.deleted_at.is_(None),
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise NotFoundError(f"Item '{item_id}' not found.")

    item.deleted_at = datetime.now(UTC)
    await db.commit()


# ---------------------------------------------------------------------------
# Versioning
# ---------------------------------------------------------------------------


async def create_item_version(
    db: AsyncSession,
    item_id: uuid.UUID,
    data: ItemVersionCreate,
    institution_id: uuid.UUID,
    authored_by_id: uuid.UUID,
) -> ItemVersion:
    # Verify item access
    result = await db.execute(
        select(Item).where(
            Item.id == item_id,
            Item.institution_id == institution_id,
            Item.deleted_at.is_(None),
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise NotFoundError(f"Item '{item_id}' not found.")

    # Determine next version number
    result = await db.execute(
        select(func.max(ItemVersion.version_number)).where(ItemVersion.item_id == item_id)
    )
    max_version = result.scalar_one_or_none() or 0

    version = ItemVersion(
        item_id=item_id,
        version_number=max_version + 1,
        content=data.content,
        explanation=data.explanation,
        media_attachments=data.media_attachments or [],
        change_summary=data.change_summary,
        authored_by_id=authored_by_id,
    )
    db.add(version)
    await db.flush()

    # Create options for this version
    db.add_all(
        [
            Option(
                item_version_id=version.id,
                key=opt.key,
                content=opt.content,
                is_correct=opt.is_correct,
                explanation=opt.explanation,
                display_order=opt.display_order,
            )
            for opt in data.options
        ]
    )

    # Promote new version to current
    item.current_version_id = version.id
    await db.flush()
    await db.commit()

    # Reload with options eager-loaded
    result = await db.execute(
        select(ItemVersion)
        .options(selectinload(ItemVersion.options))
        .where(ItemVersion.id == version.id)
    )
    return result.scalar_one()


async def list_item_versions(
    db: AsyncSession,
    item_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> list[ItemVersion]:
    # Confirm the item belongs to this institution first
    result = await db.execute(
        select(Item).where(
            Item.id == item_id,
            Item.institution_id == institution_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundError(f"Item '{item_id}' not found.")

    result = await db.execute(
        select(ItemVersion)
        .options(selectinload(ItemVersion.options))
        .where(ItemVersion.item_id == item_id)
        .order_by(ItemVersion.version_number.desc())
    )
    return list(result.scalars().all())

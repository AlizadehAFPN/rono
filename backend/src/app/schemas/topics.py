import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$")


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------


class TopicCreate(BaseModel):
    name: str
    slug: str
    parent_id: uuid.UUID | None = None
    description: str | None = None
    display_order: int = 0

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty.")
        if len(v) > 255:
            raise ValueError("Name cannot exceed 255 characters.")
        return v

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        v = v.lower().strip()
        if not _SLUG_RE.match(v):
            raise ValueError("Slug must be lowercase alphanumeric with hyphens.")
        if len(v) > 255:
            raise ValueError("Slug cannot exceed 255 characters.")
        return v


class TopicUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    display_order: int | None = None
    is_active: bool | None = None


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------


class TopicOut(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID | None
    parent_id: uuid.UUID | None
    name: str
    slug: str
    path: str
    level: int
    description: str | None
    is_active: bool
    display_order: int
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TopicTree(TopicOut):
    """TopicOut node with its children pre-populated (built in Python, not from ORM)."""

    children: list["TopicTree"] = []

    model_config = ConfigDict(from_attributes=True)

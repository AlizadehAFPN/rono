import uuid
from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, model_validator

from app.core.exams import EXAM_PARTS, EXAM_TYPES


def _check_exam_type(v: str | None) -> str | None:
    if v is not None and v not in EXAM_TYPES:
        raise ValueError(f"exam_type must be one of {sorted(EXAM_TYPES)} or null")
    return v


def _check_exam_part(v: str | None) -> str | None:
    if v is not None and v not in EXAM_PARTS:
        raise ValueError(f"exam_part must be one of {sorted(EXAM_PARTS)} or null")
    return v


# Reusable validated types — keep ItemCreate/ItemUpdate in sync without duplication.
ExamType = Annotated[str | None, AfterValidator(_check_exam_type)]
ExamPart = Annotated[str | None, AfterValidator(_check_exam_part)]

# ---------------------------------------------------------------------------
# Nested: options
# ---------------------------------------------------------------------------


class OptionCreate(BaseModel):
    key: str  # e.g. "A", "B", "C", "D"
    content: str
    is_correct: bool = False
    explanation: str | None = None
    display_order: int = 0


class OptionOut(BaseModel):
    id: uuid.UUID
    key: str
    content: str
    is_correct: bool
    explanation: str | None
    display_order: int

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Item versions
# ---------------------------------------------------------------------------


class ItemVersionCreate(BaseModel):
    content: str
    explanation: str | None = None
    options: list[OptionCreate]
    change_summary: str | None = None
    media_attachments: list[dict] = []

    @model_validator(mode="after")
    def validate_options(self) -> "ItemVersionCreate":
        if len(self.options) < 2:
            raise ValueError("At least 2 answer options are required.")
        correct = sum(1 for o in self.options if o.is_correct)
        if correct != 1:
            raise ValueError("Exactly one option must be marked as correct.")
        return self


class ItemVersionOut(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    version_number: int
    content: str
    explanation: str | None
    options: list[OptionOut]
    # Optional per-question media (e.g. [{"url": "...", "alt": "..."}]). Used by
    # the web/PWA editor and question display to show an illustrative image.
    media_attachments: list[dict] = []
    is_published: bool
    change_summary: str | None
    authored_by_id: uuid.UUID | None
    published_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionImageOut(BaseModel):
    """Returned by the image-upload endpoint; the URL is stored in a version's
    media_attachments by the client when it saves the item."""

    url: str


# ---------------------------------------------------------------------------
# Items
# ---------------------------------------------------------------------------


class ItemCreate(BaseModel):
    item_type: str = "single_best_answer"
    exam_type: ExamType = None  # executive | education | bank | social_security | None
    exam_part: ExamPart = None  # general | specialized | None
    language: str = "fa"  # ISO 639-1; Persian content by default
    source: str | None = None  # e.g. "sanjesh"
    source_reference: str | None = None  # e.g. "آزمون استخدامی آموزش و پرورش ۱۴۰۱"
    exam_year: int | None = None
    exam_session: str | None = None  # "spring" | "fall"
    topic_ids: list[uuid.UUID] = []
    primary_topic_id: uuid.UUID | None = None
    difficulty_preset: int | None = None  # 1=VeryEasy 2=Easy 3=Average 4=Hard 5=VeryHard
    version: ItemVersionCreate


class ItemUpdate(BaseModel):
    status: str | None = None
    exam_type: ExamType = None
    exam_part: ExamPart = None
    language: str | None = None
    source: str | None = None
    source_reference: str | None = None
    exam_year: int | None = None
    exam_session: str | None = None
    topic_ids: list[uuid.UUID] | None = None
    primary_topic_id: uuid.UUID | None = None
    difficulty_preset: int | None = None  # 1=VeryEasy 2=Easy 3=Average 4=Hard 5=VeryHard


class ItemOut(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID
    item_type: str
    exam_type: str | None
    exam_part: str | None
    language: str
    source: str | None
    source_reference: str | None
    exam_year: int | None
    exam_session: str | None
    status: str
    calibration_status: str
    irt_a: float | None
    irt_b: float | None
    irt_a_se: float | None
    irt_b_se: float | None
    irt_responses_used: int
    current_version: ItemVersionOut | None
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemWithTopics(ItemOut):
    """ItemOut extended with topic relationship data (populated explicitly, not from ORM)."""

    topic_ids: list[uuid.UUID] = []
    primary_topic_id: uuid.UUID | None = None


class PaginatedItems(BaseModel):
    items: list[ItemOut]
    total: int
    limit: int
    offset: int

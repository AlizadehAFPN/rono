import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, model_validator

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
    is_published: bool
    change_summary: str | None
    authored_by_id: uuid.UUID | None
    published_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Items
# ---------------------------------------------------------------------------


class ItemCreate(BaseModel):
    item_type: str = "single_best_answer"
    exam_type: str | None = None  # "usmle_step1" | "usmle_step2" | "usmle_step3" | "tus" | None
    exam_part: str | None = None  # "basic_sciences" (TTBT) | "clinical_sciences" (KTBT)
    language: str = "tr"  # ISO 639-1; single-language for now
    source: str | None = None  # e.g. "osym"
    source_reference: str | None = None  # e.g. "2013-TUS İlkbahar / TTBT"
    exam_year: int | None = None
    exam_session: str | None = None  # "spring" | "fall"
    topic_ids: list[uuid.UUID] = []
    primary_topic_id: uuid.UUID | None = None
    difficulty_preset: int | None = None  # 1=VeryEasy 2=Easy 3=Average 4=Hard 5=VeryHard
    version: ItemVersionCreate


class ItemUpdate(BaseModel):
    status: str | None = None
    exam_type: str | None = None
    exam_part: str | None = None
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

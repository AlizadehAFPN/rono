"""
Pydantic schemas for the practice-session (adaptive engine) API.

A practice session is a student's run through adaptively-selected questions. The
API deliberately separates:
  - what the student is *shown* before answering (NextItemOut — no correctness
    leaked), and
  - what they *see after* answering (AnswerResultOut — correct option,
    explanation, updated ability, next due date).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Session lifecycle
# ---------------------------------------------------------------------------


class SessionStartRequest(BaseModel):
    """Start a practice session, optionally scoped to an exam and/or topic."""

    session_type: str = Field(
        default="adaptive_practice",
        description="adaptive_practice | review (due cards only) | daily_review",
    )
    exam_type: str | None = Field(
        default=None,
        description="Exam filter: executive | education | bank | social_security",
    )
    exam_part: str | None = Field(
        default=None,
        description="Restrict to an exam section: general | specialized",
    )
    topic_id: uuid.UUID | None = Field(
        default=None, description="Restrict to items whose primary topic is this topic"
    )
    # Daily-review scope: restrict to these collections (topics). Empty/None means
    # *all* collections — the true cross-topic daily review. Supersedes topic_id.
    topic_ids: list[uuid.UUID] | None = Field(
        default=None,
        description="Daily review: restrict to these collections (topics). None/empty = all.",
    )
    items_target: int | None = Field(
        default=10, ge=1, le=500, description="Planned number of questions (the count budget)"
    )
    # Daily-review budget. 'count' caps the session at items_target questions;
    # 'time' caps it at time_limit_minutes of wall-clock (soft stop — the current
    # question always finishes). Ignored for non-daily-review sessions.
    limit_type: str | None = Field(
        default=None, description="daily_review budget kind: 'count' | 'time'"
    )
    time_limit_minutes: int | None = Field(
        default=None, ge=1, le=240, description="daily_review time budget in minutes"
    )
    # Cold-start only: a brand-new learner's self-assessment seeds the ability we
    # select the first questions from. Once they have any graded response, their
    # measured θ takes over and this is ignored — it never overrides real data.
    self_rated_level: str | None = Field(
        default=None,
        description="Cold-start prior: beginner | developing | proficient | advanced",
    )
    device_type: str | None = None


class SessionOut(BaseModel):
    id: uuid.UUID
    session_type: str
    status: str
    exam_type_scope: str | None = None
    exam_part_scope: str | None = None
    topic_scope: uuid.UUID | None = None
    # Daily-review budget (echoed back so the client can render a countdown).
    limit_type: str | None = None
    time_limit_minutes: int | None = None
    items_target: int | None
    items_delivered: int
    items_correct: int
    score_percent: float | None
    theta_start: float | None
    theta_end: float | None
    started_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Next question (pre-answer view — no correctness leaked)
# ---------------------------------------------------------------------------


class NextOptionOut(BaseModel):
    id: uuid.UUID
    key: str
    content: str
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class StimulusOut(BaseModel):
    """A shared reading passage / scenario attached to a question.

    Travels in full with each question (adaptive mode) so the learner can always
    re-read it; in exam mode the client renders it once above the contiguous run
    of items that share the same ``id``."""

    id: uuid.UUID
    content: str
    image_url: str | None = None
    group_no: int | None = None
    # Position of THIS question within its passage's run (1-based), and how many
    # questions share the passage in the current payload (exam mode only).
    order_in_group: int | None = None
    total_in_group: int | None = None


class NextItemOut(BaseModel):
    """The next adaptively-selected question, with correctness withheld."""

    session_id: uuid.UUID
    item_id: uuid.UUID
    item_version_id: uuid.UUID
    content: str
    image_url: str | None = None  # optional question image (web/PWA)
    options: list[NextOptionOut]
    primary_topic_id: uuid.UUID | None
    stimulus: StimulusOut | None = None  # shared passage, if this question has one
    # Transparency into why this item was chosen (also handy for debugging/tests).
    selection_theta: float
    item_irt_a: float
    item_irt_b: float
    fisher_information: float
    items_delivered: int
    items_target: int | None


class NoMoreItems(BaseModel):
    """Returned when the candidate pool is exhausted."""

    session_id: uuid.UUID
    detail: str = "No more questions available for this session."
    items_delivered: int


# ---------------------------------------------------------------------------
# Exam paper (whole fixed set, fetched up front — no correctness leaked)
# ---------------------------------------------------------------------------


class ExamItemOut(BaseModel):
    """One question on an exam paper. Like NextItemOut but without the adaptive
    selection metadata — an exam serves a fixed, pre-drawn set, not an adaptive
    next-pick. Correctness is still withheld until the paper is submitted."""

    item_id: uuid.UUID
    item_version_id: uuid.UUID
    content: str
    image_url: str | None = None  # optional question image (web/PWA)
    options: list[NextOptionOut]
    primary_topic_id: uuid.UUID | None
    stimulus: StimulusOut | None = None  # shared passage, if this question has one


class ExamPaperOut(BaseModel):
    """A fixed set of questions drawn for an exam-format session."""

    session_id: uuid.UUID
    items: list[ExamItemOut]
    count: int


# ---------------------------------------------------------------------------
# Answer submission + result (post-answer view)
# ---------------------------------------------------------------------------


class AnswerSubmitRequest(BaseModel):
    item_id: uuid.UUID
    selected_option_id: uuid.UUID | None = Field(
        default=None, description="Omit (or set was_skipped) to skip the question"
    )
    response_time_ms: int | None = Field(default=None, ge=0)
    was_skipped: bool = False
    is_timed_out: bool = False


class CardScheduleOut(BaseModel):
    """The FSRS scheduling outcome for the answered item."""

    rating: int
    state: str
    stability: float
    difficulty: float
    due_at: datetime | None
    scheduled_interval_days: float
    reps: int
    lapses: int


class AnswerResultOut(BaseModel):
    response_id: int
    item_id: uuid.UUID
    is_correct: bool
    was_skipped: bool
    correct_option_id: uuid.UUID | None
    explanation: str | None
    # Ability movement (global scope).
    theta_before: float
    theta_after: float
    theta_se_after: float
    # Per-topic ability movement (None if item had no primary topic).
    topic_theta_after: float | None
    # Spaced-repetition outcome.
    card: CardScheduleOut
    # Running session tally.
    items_delivered: int
    items_correct: int


class BulkAnswerSubmitRequest(BaseModel):
    """A batch of answers submitted together (real-exam mode: grade at the end).
    Processed atomically server-side — one transaction, one commit — so the session
    never ends up half-submitted from a dropped connection mid-flight."""

    answers: list[AnswerSubmitRequest] = Field(..., min_length=1, max_length=500)


class BulkAnswerResultOut(BaseModel):
    """Per-answer results for a batch submit, in request order."""

    results: list[AnswerResultOut]


# ---------------------------------------------------------------------------
# Session summary (on finish)
# ---------------------------------------------------------------------------


class SessionSummaryOut(BaseModel):
    id: uuid.UUID
    status: str
    items_delivered: int
    items_correct: int
    items_skipped: int
    items_wrong: int
    score_percent: float | None
    # Exam-style raw score: correct - wrong * penalty_per_wrong (blanks excluded).
    net_score: float | None
    penalty_per_wrong: float | None
    theta_start: float | None
    theta_end: float | None
    theta_delta: float | None
    started_at: datetime
    completed_at: datetime | None
    time_spent_seconds: int | None

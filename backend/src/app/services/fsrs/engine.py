"""
FSRS-5 spaced-repetition engine.

Thin, deterministic wrapper around the official ``fsrs`` library that:
  1. maps a graded practice response (binary correct/incorrect + response time)
     onto an FSRS 1-4 rating, and
  2. advances a card's memory state (difficulty, stability, due date) by one
     review, translating between our persisted ``card_states`` columns and the
     library's ``Card`` object.

Determinism
-----------
The shared :data:`SCHEDULER` is configured with ``enable_fuzzing=False`` so the
same (card, rating, time) always produces the same schedule — essential for
reproducible tests and reproducible study plans. Learning/relearning steps are
empty, so cards schedule purely on day-scale stability (no sub-day "1 min / 10
min" steps). This matches a question-bank workflow (you don't re-show an item
minutes later) and, crucially, means a card is fully reconstructable from the
columns we store — there is no hidden intra-session ``step`` to persist.

Rating policy (time-weighted, per the product decision)
-------------------------------------------------------
  incorrect            -> Again (1)
  correct & very fast  -> Easy  (4)
  correct & slow       -> Hard  (2)
  correct (normal)     -> Good  (3)

"Fast" / "slow" are judged relative to the item's own average response time when
known (so an inherently long vignette isn't punished), falling back to absolute
wall-clock thresholds otherwise.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from fsrs import Card, Rating, Scheduler, State

# ---------------------------------------------------------------------------
# Deterministic scheduler (module-level, stateless across reviews)
# ---------------------------------------------------------------------------
SCHEDULER = Scheduler(
    enable_fuzzing=False,
    learning_steps=(),
    relearning_steps=(),
)

# Map our persisted state strings <-> the library's State enum.
# "new" is our own sentinel for a card that has never been reviewed; the library
# has no "new" state, so a fresh Card is constructed instead.
_STATE_TO_STR: dict[State, str] = {
    State.Learning: "learning",
    State.Review: "review",
    State.Relearning: "relearning",
}
_STR_TO_STATE: dict[str, State] = {v: k for k, v in _STATE_TO_STR.items()}

# ---------------------------------------------------------------------------
# Time-weighting thresholds for rating derivation
# ---------------------------------------------------------------------------
# Relative thresholds (fraction of the item's average response time).
FAST_RATIO: float = 0.5  # answered in < 50% of average time => Easy
SLOW_RATIO: float = 1.5  # answered in > 150% of average time => Hard
# Absolute fallbacks (milliseconds) when no per-item average is available.
ABS_FAST_MS: int = 8_000  # < 8s => Easy
ABS_SLOW_MS: int = 30_000  # > 30s => Hard


@dataclass(frozen=True)
class CardSnapshot:
    """Our domain representation of a card's memory state at a point in time."""

    state: str
    difficulty: float
    stability: float
    due_at: datetime | None
    last_review_at: datetime | None
    reps: int
    lapses: int
    retrievability: float | None


@dataclass(frozen=True)
class ScheduleResult:
    """Outcome of advancing a card by one review."""

    rating: int
    before: CardSnapshot
    after: CardSnapshot
    scheduled_interval_days: float
    elapsed_days: float


# ---------------------------------------------------------------------------
# Rating derivation
# ---------------------------------------------------------------------------


def rating_from_response(
    is_correct: bool,
    response_time_ms: int | None = None,
    item_avg_ms: int | None = None,
) -> Rating:
    """
    Derive an FSRS rating from a graded response and how long it took.

    Incorrect answers are always ``Again``. Correct answers are graded by speed
    relative to the item's average (or absolute fallbacks), so confident-and-fast
    recall earns a longer interval than slow, effortful recall.
    """
    if not is_correct:
        return Rating.Again

    if response_time_ms is None:
        return Rating.Good

    if item_avg_ms and item_avg_ms > 0:
        ratio = response_time_ms / item_avg_ms
        if ratio < FAST_RATIO:
            return Rating.Easy
        if ratio > SLOW_RATIO:
            return Rating.Hard
        return Rating.Good

    # No per-item baseline: fall back to absolute wall-clock thresholds.
    if response_time_ms < ABS_FAST_MS:
        return Rating.Easy
    if response_time_ms > ABS_SLOW_MS:
        return Rating.Hard
    return Rating.Good


# ---------------------------------------------------------------------------
# Card reconstruction <-> library
# ---------------------------------------------------------------------------


def _to_library_card(snap: CardSnapshot) -> Card:
    """Build a library ``Card`` from our stored snapshot.

    A never-reviewed card (state == "new") becomes a fresh ``Card`` with no
    stability/difficulty yet, so the library initialises them on first review.
    """
    if snap.state == "new" or snap.reps == 0:
        return Card()
    return Card(
        state=_STR_TO_STATE.get(snap.state, State.Review),
        stability=snap.stability,
        difficulty=snap.difficulty,
        due=snap.due_at,
        last_review=snap.last_review_at,
    )


# ---------------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------------


def schedule_review(
    snap: CardSnapshot,
    rating: Rating,
    now: datetime | None = None,
) -> ScheduleResult:
    """
    Advance a card by one review and return the before/after snapshots.

    ``lapses`` increments when a previously-learned card (not new) is rated
    ``Again``. ``reps`` increments on every review. ``retrievability`` is the
    model's predicted recall probability at review time (1.0 for a brand-new
    card, since there is nothing yet to forget).
    """
    now = now or datetime.now(UTC)

    card = _to_library_card(snap)
    elapsed_days = 0.0
    # Predicted recall probability at the moment the student answered. Undefined
    # for a never-reviewed card (nothing has been committed to memory yet).
    retrievability_before: float | None = None
    if snap.last_review_at is not None and snap.reps > 0:
        elapsed_days = max((now - snap.last_review_at).total_seconds() / 86_400.0, 0.0)
        retrievability_before = SCHEDULER.get_card_retrievability(card, now)

    updated, _log = SCHEDULER.review_card(card, rating, now)

    was_lapse = rating == Rating.Again and snap.reps > 0
    new_reps = snap.reps + 1
    new_lapses = snap.lapses + (1 if was_lapse else 0)
    scheduled_interval_days = (
        (updated.due - now).total_seconds() / 86_400.0 if updated.due else 0.0
    )

    after = CardSnapshot(
        state=_STATE_TO_STR.get(updated.state, "review"),
        difficulty=float(updated.difficulty),
        stability=float(updated.stability),
        due_at=updated.due,
        last_review_at=updated.last_review or now,
        reps=new_reps,
        lapses=new_lapses,
        retrievability=retrievability_before,
    )

    return ScheduleResult(
        rating=int(rating),
        before=snap,
        after=after,
        scheduled_interval_days=scheduled_interval_days,
        elapsed_days=elapsed_days,
    )


def new_card_snapshot() -> CardSnapshot:
    """The initial state for a card a user has never seen — matches DB defaults."""
    return CardSnapshot(
        state="new",
        difficulty=5.0,
        stability=0.0,
        due_at=None,
        last_review_at=None,
        reps=0,
        lapses=0,
        retrievability=None,
    )

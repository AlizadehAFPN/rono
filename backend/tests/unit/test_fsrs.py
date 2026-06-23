"""
Unit tests for the FSRS-5 engine wrapper.

Two concerns are verified:
  1. **Rating derivation** — the time-weighted mapping from (correct?, time) to an
     FSRS 1-4 rating, including relative vs. absolute thresholds.
  2. **Scheduling invariants** — that advancing a card behaves as FSRS-5 must:
     better ratings buy longer/stronger memory, lapses are counted, state
     transitions are correct, and the schedule is deterministic.

Determinism is guaranteed by the shared no-fuzzing scheduler, so exact-ish
assertions are safe.
"""

from datetime import UTC, datetime, timedelta

import pytest
from fsrs import Rating

from app.services.fsrs.engine import (
    new_card_snapshot,
    rating_from_response,
    schedule_review,
)

NOW = datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC)


# ---------------------------------------------------------------------------
# rating_from_response — the binary->4-rating, time-weighted mapping
# ---------------------------------------------------------------------------


def test_incorrect_is_always_again():
    assert rating_from_response(False) == Rating.Again
    assert rating_from_response(False, response_time_ms=500) == Rating.Again
    assert rating_from_response(False, response_time_ms=500, item_avg_ms=10_000) == Rating.Again


def test_correct_without_timing_is_good():
    assert rating_from_response(True) == Rating.Good


def test_correct_relative_to_item_average():
    avg = 20_000  # 20s average for this (long vignette) item
    # < 50% of average -> Easy
    assert rating_from_response(True, response_time_ms=8_000, item_avg_ms=avg) == Rating.Easy
    # within band -> Good
    assert rating_from_response(True, response_time_ms=20_000, item_avg_ms=avg) == Rating.Good
    # > 150% of average -> Hard
    assert rating_from_response(True, response_time_ms=35_000, item_avg_ms=avg) == Rating.Hard


def test_correct_absolute_fallback_without_item_average():
    # No per-item baseline -> absolute thresholds (8s / 30s).
    assert rating_from_response(True, response_time_ms=3_000) == Rating.Easy
    assert rating_from_response(True, response_time_ms=15_000) == Rating.Good
    assert rating_from_response(True, response_time_ms=45_000) == Rating.Hard


def test_long_vignette_not_punished_relative_to_its_own_average():
    # 25s would be "slow" on the absolute scale, but it's normal for a 24s-avg item.
    assert rating_from_response(True, response_time_ms=25_000, item_avg_ms=24_000) == Rating.Good


# ---------------------------------------------------------------------------
# schedule_review — first review of a brand-new card
# ---------------------------------------------------------------------------


def test_new_card_snapshot_defaults_match_db():
    snap = new_card_snapshot()
    assert snap.state == "new"
    assert snap.reps == 0 and snap.lapses == 0
    assert snap.difficulty == 5.0 and snap.stability == 0.0
    assert snap.due_at is None and snap.last_review_at is None


def test_first_review_initialises_memory_state():
    res = schedule_review(new_card_snapshot(), Rating.Good, now=NOW)
    after = res.after
    assert after.reps == 1
    assert after.lapses == 0  # rating Good on a new card is not a lapse
    assert after.stability > 0.0
    assert after.due_at is not None and after.due_at > NOW
    assert after.state in ("review", "learning")
    # A brand-new card has no prior memory to recall, so retrievability is undefined.
    assert after.retrievability is None


def test_better_rating_yields_more_stability_and_longer_interval():
    snap = new_card_snapshot()
    again = schedule_review(snap, Rating.Again, now=NOW)
    hard = schedule_review(snap, Rating.Hard, now=NOW)
    good = schedule_review(snap, Rating.Good, now=NOW)
    easy = schedule_review(snap, Rating.Easy, now=NOW)

    # Stability is strictly ordered by rating quality.
    stabilities = [again.after.stability, hard.after.stability, good.after.stability, easy.after.stability]
    assert stabilities == sorted(stabilities)
    assert len(set(stabilities)) == 4  # strictly increasing, no ties

    # Scheduled interval is non-decreasing with rating quality.
    intervals = [
        again.scheduled_interval_days,
        hard.scheduled_interval_days,
        good.scheduled_interval_days,
        easy.scheduled_interval_days,
    ]
    assert intervals == sorted(intervals)
    assert easy.scheduled_interval_days > again.scheduled_interval_days


# ---------------------------------------------------------------------------
# schedule_review — subsequent reviews, lapses, state transitions
# ---------------------------------------------------------------------------


def _review_card(snap, rating, now):
    """Apply one review and return the resulting snapshot (helper)."""
    return schedule_review(snap, rating, now=now).after


def test_successful_reviews_grow_stability_over_time():
    snap = new_card_snapshot()
    snap = _review_card(snap, Rating.Good, NOW)
    s1 = snap.stability
    # Review again at its due date, again correct.
    snap2 = _review_card(snap, Rating.Good, snap.due_at)
    assert snap2.stability > s1
    assert snap2.reps == 2
    assert snap2.lapses == 0


def test_lapse_is_counted_and_reduces_stability():
    snap = new_card_snapshot()
    snap = _review_card(snap, Rating.Good, NOW)        # learn it
    snap = _review_card(snap, Rating.Good, snap.due_at)  # strengthen
    strong_stability = snap.stability
    assert snap.lapses == 0

    # Now forget it: Again on a learned card is a lapse.
    res = schedule_review(snap, Rating.Again, now=snap.due_at)
    assert res.after.lapses == 1
    assert res.after.stability < strong_stability


def test_again_on_new_card_is_not_a_lapse():
    res = schedule_review(new_card_snapshot(), Rating.Again, now=NOW)
    assert res.after.lapses == 0  # never learned => can't lapse
    assert res.after.reps == 1


def test_retrievability_decays_between_reviews():
    snap = _review_card(new_card_snapshot(), Rating.Good, NOW)
    # Review well after the due date: predicted recall at answer time should be
    # below 1.0 and below the desired retention (memory has decayed).
    overdue = snap.due_at + timedelta(days=5)
    res = schedule_review(snap, Rating.Good, now=overdue)
    assert res.before.state != "new"
    assert res.after.retrievability is not None
    assert 0.0 < res.after.retrievability < 0.95
    assert res.elapsed_days > 0


def test_scheduling_is_deterministic():
    snap = new_card_snapshot()
    a = schedule_review(snap, Rating.Good, now=NOW)
    b = schedule_review(snap, Rating.Good, now=NOW)
    assert a.after.stability == b.after.stability
    assert a.after.due_at == b.after.due_at
    assert a.scheduled_interval_days == b.scheduled_interval_days


def test_difficulty_stays_in_valid_range():
    # FSRS difficulty is bounded to [1, 10]; repeated easy/again must not escape it.
    snap = new_card_snapshot()
    now = NOW
    for rating in (Rating.Easy, Rating.Easy, Rating.Easy):
        snap = _review_card(snap, rating, now)
        now = snap.due_at
        assert 1.0 <= snap.difficulty <= 10.0
    snap = new_card_snapshot()
    now = NOW
    for rating in (Rating.Again, Rating.Again, Rating.Again):
        snap = _review_card(snap, rating, now)
        now = snap.due_at
        assert 1.0 <= snap.difficulty <= 10.0

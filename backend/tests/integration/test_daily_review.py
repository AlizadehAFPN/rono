"""
Integration tests for the daily-review session.

A daily review is a cross-topic study loop with a budget. It must:
  * prioritise due/re-learning cards, most-overdue first (FSRS retention urgency),
  * fall back to new cards (IRT difficulty-matched) only when nothing is due,
  * end cleanly ("done for today") instead of practising ahead,
  * stop server-side when the count or time budget is spent, and
  * seed a brand-new learner's selection θ from their self-assessment, then never
    again once real responses exist.

These assert at the service layer, which is deterministic for the due-card path
(sorted by due_at) and independent of the random tie-break used for new cards.
"""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import update as sql_update

from app.models.card_state import CardState
from app.models.practice_session import PracticeSession
from app.models.review_log import ReviewLog
from app.services import practice_service

pytestmark = pytest.mark.asyncio


async def _daily_session(db, seed, *, topic_ids=None, limit_type=None,
                         time_limit_minutes=None, self_rated_level=None,
                         items_target=20):
    return await practice_service.start_session(
        db,
        user_id=seed.user_id,
        institution_id=seed.institution_id,
        session_type="daily_review",
        exam_type=seed.exam_type,
        exam_part=None,
        topic_id=None,
        items_target=items_target,
        device_type=None,
        topic_ids=topic_ids,
        limit_type=limit_type,
        time_limit_minutes=time_limit_minutes,
        self_rated_level=self_rated_level,
    )


async def _make_due_card(db, seed, item_id, *, due_at, state="review") -> None:
    now = datetime.now(UTC)
    db.add(
        CardState(
            user_id=seed.user_id,
            item_id=item_id,
            institution_id=seed.institution_id,
            state=state,
            difficulty=5.0,
            stability=10.0,
            due_at=due_at,
            last_review_at=now - timedelta(days=11),
            reps=1,
            lapses=1 if state == "relearning" else 0,
        )
    )
    await db.flush()


# --- Selection priority -----------------------------------------------------


async def test_due_card_wins_over_new(db, seed):
    """Any due card outranks new material — retention before growth."""
    due_item = seed.item_ids[0]
    await _make_due_card(db, seed, due_item, due_at=datetime.now(UTC) - timedelta(days=1))

    session = await _daily_session(db, seed)
    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)

    assert item is not None
    assert item.id == due_item


async def test_most_overdue_due_card_first(db, seed):
    """Among due cards, the one closest to being forgotten (earliest due_at) wins."""
    now = datetime.now(UTC)
    slightly_due = seed.item_ids[0]
    very_overdue = seed.item_ids[1]
    await _make_due_card(db, seed, slightly_due, due_at=now - timedelta(hours=1))
    await _make_due_card(db, seed, very_overdue, due_at=now - timedelta(days=9))

    session = await _daily_session(db, seed)
    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)

    assert item is not None
    assert item.id == very_overdue


async def test_new_card_when_nothing_due(db, seed):
    """With nothing due, a daily review introduces new material."""
    session = await _daily_session(db, seed)
    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)

    assert item is not None
    assert item.id in set(seed.item_ids)  # all seeded items are brand-new


async def test_done_for_today_when_caught_up(db, seed):
    """Nothing due + new budget spent => session ends (no practise-ahead)."""
    now = datetime.now(UTC)
    for _ in range(practice_service.NEW_CARDS_PER_DAY):
        db.add(
            ReviewLog(
                user_id=seed.user_id,
                item_id=seed.item_ids[0],
                rating=3,
                state_before="new",
                difficulty_before=5.0,
                stability_before=0.0,
                state_after="review",
                difficulty_after=5.0,
                stability_after=10.0,
                scheduled_interval_days=10.0,
                elapsed_days=0.0,
                reviewed_at=now,
            )
        )
    # A future-due card exists but must NOT be served (not due yet).
    await _make_due_card(db, seed, seed.item_ids[1], due_at=now + timedelta(days=3))
    await db.flush()

    session = await _daily_session(db, seed)
    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)

    assert item is None  # caught up for today


# --- Budget enforcement (server-side) ---------------------------------------


async def test_count_budget_stops_session(db, seed):
    """Once items_delivered reaches the count budget, no more questions are served."""
    session = await _daily_session(db, seed, limit_type="count", items_target=3)
    await db.execute(
        sql_update(PracticeSession)
        .where(PracticeSession.id == session.id)
        .values(items_delivered=3)
    )
    await db.flush()

    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)
    assert item is None


async def test_time_budget_stops_session(db, seed):
    """A time-budgeted session stops once wall-clock exceeds the limit."""
    session = await _daily_session(
        db, seed, limit_type="time", time_limit_minutes=5, items_target=None
    )
    # Pretend it started 10 minutes ago — past the 5-minute budget.
    await db.execute(
        sql_update(PracticeSession)
        .where(PracticeSession.id == session.id)
        .values(started_at=datetime.now(UTC) - timedelta(minutes=10))
    )
    await db.flush()

    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)
    assert item is None


async def test_time_budget_serves_within_window(db, seed):
    """Inside the time window, questions still flow."""
    session = await _daily_session(
        db, seed, limit_type="time", time_limit_minutes=30, items_target=None
    )
    _, item, _, _ = await practice_service.get_next_item(db, session.id, seed.user_id)
    assert item is not None


# --- Multi-topic scope ------------------------------------------------------


async def test_topic_ids_scope_restricts_candidates(db, seed):
    """topic_ids restricts the candidate pool to the chosen collections."""
    session = await _daily_session(db, seed, topic_ids=[seed.domain_topic_id])
    cands = await practice_service._candidate_items(
        db, session, exam_type=seed.exam_type, exam_part=None,
        topic_ids=[seed.domain_topic_id], review_only=False,
    )
    assert {c.id for c in cands} == set(seed.item_ids)

    # An unrelated topic id yields nothing.
    empty = await practice_service._candidate_items(
        db, session, exam_type=seed.exam_type, exam_part=None,
        topic_ids=[seed.exam_topic_id], review_only=False,
    )
    assert empty == []


# --- Cold-start self-rating seed --------------------------------------------


async def test_self_rating_seeds_selection_theta_for_new_learner(db, seed):
    """A brand-new learner's selection θ comes from their self-assessment."""
    session = await _daily_session(db, seed, self_rated_level="advanced")
    _, item, selection_theta, _ = await practice_service.get_next_item(
        db, session.id, seed.user_id
    )
    assert item is not None
    assert selection_theta == practice_service._SELF_RATED_THETA["advanced"]


async def test_no_self_rating_uses_global_theta(db, seed):
    """Without a self-rating, selection falls back to the measured (default 0) θ."""
    session = await _daily_session(db, seed)
    _, _, selection_theta, _ = await practice_service.get_next_item(
        db, session.id, seed.user_id
    )
    assert selection_theta == 0.0

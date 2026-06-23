"""
Integration tests for the mixed study queue.

A single adaptive (non-review) session must surface three kinds of question at
once — brand-new cards, due review cards, and due re-learning cards — instead of
serving one mode at a time. The daily new-card budget throttles *only* the new
cards; due review/relearning cards are never capped by it.

These assert the behaviour at the service-pool level, which is deterministic and
independent of the random tie-break used for the final IRT pick.
"""

from datetime import UTC, datetime, timedelta

import pytest

from app.models.card_state import CardState
from app.models.review_log import ReviewLog
from app.services import practice_service

pytestmark = pytest.mark.asyncio


async def _adaptive_session(db, seed):
    return await practice_service.start_session(
        db,
        user_id=seed.user_id,
        institution_id=seed.institution_id,
        session_type="adaptive_practice",
        exam_type=seed.exam_type,
        exam_part=None,
        topic_id=None,
        items_target=None,
        device_type=None,
    )


async def _candidates(db, seed, session):
    return await practice_service._candidate_items(
        db,
        session,
        exam_type=seed.exam_type,
        exam_part=None,
        topic_ids=None,
        review_only=False,
    )


async def _make_due_card(db, seed, item_id, *, state: str) -> None:
    """Insert an overdue card for the user so it counts as 'due now'."""
    now = datetime.now(UTC)
    db.add(
        CardState(
            user_id=seed.user_id,
            item_id=item_id,
            institution_id=seed.institution_id,
            state=state,
            difficulty=5.0,
            stability=10.0,
            due_at=now - timedelta(days=1),  # overdue => due now
            last_review_at=now - timedelta(days=11),
            reps=1,
            lapses=1 if state == "relearning" else 0,
        )
    )
    await db.flush()


async def test_new_review_and_relearning_share_one_pool(db, seed):
    """The headline requirement: new + due-review + due-relearning together."""
    review_item = seed.item_ids[0]
    relearn_item = seed.item_ids[1]
    await _make_due_card(db, seed, review_item, state="review")
    await _make_due_card(db, seed, relearn_item, state="relearning")

    session = await _adaptive_session(db, seed)
    pool = await practice_service._mixed_study_pool(
        db, session, await _candidates(db, seed, session)
    )
    pool_ids = {i.id for i in pool}

    assert review_item in pool_ids  # due review card is eligible
    assert relearn_item in pool_ids  # due re-learning card is eligible
    new_ids = set(seed.item_ids[2:])  # the rest are brand-new
    assert new_ids & pool_ids, "brand-new questions must be mixed in alongside due cards"


async def test_daily_new_cap_blocks_new_but_never_due(db, seed):
    now = datetime.now(UTC)
    # Spend today's entire new-card budget via 'new' first-review logs.
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
    await db.flush()

    assert await practice_service._new_cards_remaining_today(db, seed.user_id, now) == 0

    due_item = seed.item_ids[1]
    await _make_due_card(db, seed, due_item, state="review")

    session = await _adaptive_session(db, seed)
    pool = await practice_service._mixed_study_pool(
        db, session, await _candidates(db, seed, session)
    )
    pool_ids = {i.id for i in pool}

    assert due_item in pool_ids  # due cards are never throttled by the new-card cap
    brand_new = set(seed.item_ids) - {due_item}
    assert not (brand_new & pool_ids), "new cards must be withheld once the daily cap is hit"


async def test_new_cards_flow_until_cap(db, seed):
    """With nothing due, the pool is exactly the still-available new budget."""
    now = datetime.now(UTC)
    assert (
        await practice_service._new_cards_remaining_today(db, seed.user_id, now)
        == practice_service.NEW_CARDS_PER_DAY
    )

    session = await _adaptive_session(db, seed)
    pool = await practice_service._mixed_study_pool(
        db, session, await _candidates(db, seed, session)
    )
    # All six seeded items are brand-new and the budget (20) is not yet spent,
    # so every one is eligible.
    assert {i.id for i in pool} == set(seed.item_ids)

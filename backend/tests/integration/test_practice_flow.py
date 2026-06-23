"""
Integration tests for the adaptive practice flow.

These exercise the full stack — HTTP endpoint → service → IRT/FSRS engines →
Postgres — against a real database in a rolled-back transaction. They assert the
*behaviour* a student would experience and that every side-effect table is
written correctly.

They are skipped automatically when Postgres is unavailable (see conftest).
"""

import uuid

import pytest
from sqlalchemy import func, select

from app.models.card_state import CardState
from app.models.response import Response
from app.models.review_log import ReviewLog
from app.models.theta_history import ThetaHistory
from app.models.user_theta import UserTheta
from app.models.user_topic_mastery import UserTopicMastery

pytestmark = pytest.mark.asyncio


async def _start_session(auth_client, **body):
    payload = {"exam_type": "usmle_step1", "items_target": 10, **body}
    resp = await auth_client.post("/api/v1/sessions/", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _answer(auth_client, session_id, item, *, correct: bool, response_time_ms=12_000):
    """Answer the served item, choosing the correct or an incorrect option."""
    # The /next view withholds is_correct, so we resolve correctness via the
    # answer result. For "correct", we must know the right option id — we pick
    # the first option for "correct=True" seeds where key 'A' is correct, else a
    # different one. To stay robust, submit and let the result tell us.
    correct_option = next(o for o in item["options"] if o["key"] == "A")
    other_option = next(o for o in item["options"] if o["key"] != "A")
    chosen = correct_option if correct else other_option
    resp = await auth_client.post(
        f"/api/v1/sessions/{session_id}/answer",
        json={
            "item_id": item["item_id"],
            "selected_option_id": chosen["id"],
            "response_time_ms": response_time_ms,
        },
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Session lifecycle
# ---------------------------------------------------------------------------


async def test_start_session_captures_initial_theta(auth_client, seed):
    body = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    assert body["status"] == "in_progress"
    assert body["items_delivered"] == 0
    assert body["theta_start"] == pytest.approx(0.0, abs=1e-6)  # cold start
    assert body["topic_scope"] == str(seed.domain_topic_id)


async def test_next_returns_question_without_leaking_correctness(auth_client, seed):
    session = await _start_session(auth_client)
    resp = await auth_client.get(f"/api/v1/sessions/{session['id']}/next")
    assert resp.status_code == 200, resp.text
    nxt = resp.json()
    assert "item_id" in nxt
    assert len(nxt["options"]) == 4
    # Crucially, the pre-answer payload must not reveal which option is correct.
    for opt in nxt["options"]:
        assert "is_correct" not in opt
    assert "fisher_information" in nxt and nxt["fisher_information"] >= 0


# ---------------------------------------------------------------------------
# Answering: grading, theta movement, FSRS scheduling, persistence
# ---------------------------------------------------------------------------


async def test_correct_answer_raises_ability_and_schedules_card(auth_client, seed, db):
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()

    result = await _answer(auth_client, session["id"], nxt, correct=True)

    assert result["is_correct"] is True
    assert result["correct_option_id"] is not None
    # Getting a question right should not lower estimated ability.
    assert result["theta_after"] >= result["theta_before"]
    assert result["theta_se_after"] < 1.0  # we learned something => less uncertain
    # FSRS produced a real schedule.
    card = result["card"]
    assert card["rating"] in (2, 3, 4)  # correct => Hard/Good/Easy, never Again
    assert card["reps"] == 1
    assert card["lapses"] == 0
    assert card["due_at"] is not None
    assert card["scheduled_interval_days"] > 0
    assert result["items_correct"] == 1

    # Side effects persisted.
    resp_count = await db.scalar(
        select(func.count()).select_from(Response).where(Response.user_id == seed.user_id)
    )
    assert resp_count == 1
    card_row = await db.scalar(
        select(CardState).where(
            CardState.user_id == seed.user_id, CardState.item_id == uuid.UUID(nxt["item_id"])
        )
    )
    assert card_row is not None and card_row.reps == 1
    review_count = await db.scalar(
        select(func.count()).select_from(ReviewLog).where(ReviewLog.user_id == seed.user_id)
    )
    assert review_count == 1
    # Global + topic theta histories both written.
    theta_hist = await db.scalar(
        select(func.count()).select_from(ThetaHistory).where(ThetaHistory.user_id == seed.user_id)
    )
    assert theta_hist == 2


async def test_incorrect_answer_lowers_ability_and_rates_again(auth_client, seed):
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()

    result = await _answer(auth_client, session["id"], nxt, correct=False)
    assert result["is_correct"] is False
    assert result["theta_after"] <= result["theta_before"]
    assert result["card"]["rating"] == 1  # Again
    assert result["items_correct"] == 0


async def test_fast_correct_answer_is_rated_easy(auth_client, seed):
    session = await _start_session(auth_client)
    nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()
    # No per-item average => absolute fallback; < 8s is "Easy".
    result = await _answer(auth_client, session["id"], nxt, correct=True, response_time_ms=2_000)
    assert result["card"]["rating"] == 4  # Easy


async def test_skip_records_response_without_scheduling_or_theta_change(auth_client, seed, db):
    session = await _start_session(auth_client)
    nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()

    resp = await auth_client.post(
        f"/api/v1/sessions/{session['id']}/answer",
        json={"item_id": nxt["item_id"], "was_skipped": True},
    )
    assert resp.status_code == 200, resp.text
    result = resp.json()
    assert result["was_skipped"] is True
    # Skipping carries no information: ability unchanged, no card scheduled.
    assert result["theta_after"] == pytest.approx(result["theta_before"])
    assert result["card"]["reps"] == 0
    # No card row, no review log for a skip.
    card_row = await db.scalar(
        select(CardState).where(CardState.user_id == seed.user_id)
    )
    assert card_row is None
    review_count = await db.scalar(
        select(func.count()).select_from(ReviewLog).where(ReviewLog.user_id == seed.user_id)
    )
    assert review_count == 0


# ---------------------------------------------------------------------------
# Adaptivity + no-repeats + completion
# ---------------------------------------------------------------------------


async def test_no_item_is_served_twice_in_a_session(auth_client, seed):
    session = await _start_session(auth_client)
    seen: set[str] = set()
    for _ in range(len(seed.item_ids)):
        nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()
        assert "item_id" in nxt, nxt
        assert nxt["item_id"] not in seen
        seen.add(nxt["item_id"])
        await _answer(auth_client, session["id"], nxt, correct=True)

    # Pool exhausted => NoMoreItems.
    exhausted = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()
    assert exhausted["detail"].startswith("No more questions")
    assert len(seen) == len(seed.item_ids)


async def test_adaptive_selection_climbs_with_correct_answers(auth_client, seed):
    """As the student answers correctly, estimated ability rises and the engine
    should offer progressively harder items (higher irt_b)."""
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))

    selection_thetas: list[float] = []
    difficulties: list[float] = []
    for _ in range(len(seed.item_ids)):
        nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()
        if "item_id" not in nxt:
            break
        selection_thetas.append(nxt["selection_theta"])
        difficulties.append(nxt["item_irt_b"])
        await _answer(auth_client, session["id"], nxt, correct=True)

    # Ability used for selection is non-decreasing across the run of correct answers.
    assert selection_thetas == sorted(selection_thetas)
    assert selection_thetas[-1] > selection_thetas[0]
    # As ability climbed, the engine reached the hardest item *before* falling
    # back to the easiest leftover — the signature of difficulty-tracking
    # adaptive selection. (The very last pick is whatever remains, often easy.)
    assert difficulties.index(max(difficulties)) < difficulties.index(min(difficulties))


async def test_finish_returns_summary_with_theta_delta(auth_client, seed):
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    for _ in range(3):
        nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()
        await _answer(auth_client, session["id"], nxt, correct=True)

    resp = await auth_client.post(f"/api/v1/sessions/{session['id']}/finish")
    assert resp.status_code == 200, resp.text
    summary = resp.json()
    assert summary["status"] == "completed"
    assert summary["items_delivered"] == 3
    assert summary["items_correct"] == 3
    assert summary["score_percent"] == pytest.approx(100.0)
    assert summary["theta_delta"] is not None and summary["theta_delta"] > 0
    assert summary["completed_at"] is not None


async def test_ability_persists_across_sessions(auth_client, seed, db):
    """θ learned in one session is the starting point of the next — proving the
    per-user ability estimate is durable, not session-local."""
    s1 = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    for _ in range(3):
        nxt = (await auth_client.get(f"/api/v1/sessions/{s1['id']}/next")).json()
        await _answer(auth_client, s1["id"], nxt, correct=True)
    await auth_client.post(f"/api/v1/sessions/{s1['id']}/finish")

    s2 = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    assert s2["theta_start"] > 0.0  # carried over from session 1

    # Mastery rollup reflects the topic practice.
    mastery = await db.scalar(
        select(UserTopicMastery).where(
            UserTopicMastery.user_id == seed.user_id,
            UserTopicMastery.topic_id == seed.domain_topic_id,
        )
    )
    assert mastery is not None
    assert mastery.total_responses == 3
    assert mastery.correct_responses == 3
    assert float(mastery.accuracy_rate) == pytest.approx(1.0)


async def test_bulk_answers_grade_atomically_and_accumulate_counters(auth_client, seed, db):
    """The exam-format bulk submit grades a whole paper in one round-trip: every
    answer is persisted, session counters accumulate across the batch (not stuck at
    the first answer's value), and one entry is returned per submitted answer."""
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    paper = (
        await auth_client.get(f"/api/v1/sessions/{session['id']}/exam-paper?count=4")
    ).json()
    items = paper["items"]
    assert len(items) == 4

    # Three answered (correct), one deliberately skipped.
    answers = []
    for i, it in enumerate(items):
        if i == 3:
            answers.append({"item_id": it["item_id"], "was_skipped": True})
        else:
            correct = next(o for o in it["options"] if o["key"] == "A")
            answers.append({"item_id": it["item_id"], "selected_option_id": correct["id"]})

    resp = await auth_client.post(
        f"/api/v1/sessions/{session['id']}/bulk-answers", json={"answers": answers}
    )
    assert resp.status_code == 200, resp.text
    results = resp.json()["results"]
    assert len(results) == 4
    # Counters accumulate across the batch — the last answer sees all 4 delivered.
    assert [r["items_delivered"] for r in results] == [1, 2, 3, 4]
    assert results[-1]["items_correct"] == 3
    assert results[3]["was_skipped"] is True

    # Every answer was persisted (atomic batch — nothing dropped).
    persisted = await db.scalar(
        select(func.count())
        .select_from(Response)
        .where(Response.session_id == uuid.UUID(session["id"]))
    )
    assert persisted == 4

    summary = (
        await auth_client.post(f"/api/v1/sessions/{session['id']}/finish")
    ).json()
    assert summary["items_delivered"] == 4
    assert summary["items_correct"] == 3
    assert summary["items_skipped"] == 1


async def test_bulk_answers_rejected_on_finished_session(auth_client, seed):
    """A bulk submit against an already-finished session is refused (not silently
    re-graded)."""
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    paper = (
        await auth_client.get(f"/api/v1/sessions/{session['id']}/exam-paper?count=2")
    ).json()
    await auth_client.post(f"/api/v1/sessions/{session['id']}/finish")

    answers = [{"item_id": it["item_id"], "was_skipped": True} for it in paper["items"]]
    resp = await auth_client.post(
        f"/api/v1/sessions/{session['id']}/bulk-answers", json={"answers": answers}
    )
    assert resp.status_code == 400, resp.text


async def test_global_and_topic_theta_rows_are_maintained(auth_client, seed, db):
    session = await _start_session(auth_client, topic_id=str(seed.domain_topic_id))
    nxt = (await auth_client.get(f"/api/v1/sessions/{session['id']}/next")).json()
    await _answer(auth_client, session["id"], nxt, correct=True)

    global_theta = await db.scalar(
        select(UserTheta).where(
            UserTheta.user_id == seed.user_id, UserTheta.topic_id.is_(None)
        )
    )
    topic_theta = await db.scalar(
        select(UserTheta).where(
            UserTheta.user_id == seed.user_id, UserTheta.topic_id == seed.domain_topic_id
        )
    )
    assert global_theta is not None and global_theta.responses_used == 1
    assert topic_theta is not None and topic_theta.responses_used == 1

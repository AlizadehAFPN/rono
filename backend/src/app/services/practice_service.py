"""
Practice-session service — the adaptive engine orchestration layer.

This is where the pure IRT and FSRS engines meet persistence. A single answer
submission drives a precise, ordered cascade of writes:

    1. grade the response against the correct option
    2. INSERT the Response row (flushed so it is part of ability history)
    3. FSRS: advance the card, INSERT a ReviewLog
    4. IRT: recompute global θ and per-topic θ via EAP over full history,
       UPDATE user_thetas, INSERT theta_history snapshots
    5. update session counters and θ_end
    6. update per-topic mastery rollup
    7. commit

Numeric columns are updated with explicit SQL UPDATE statements (not ORM
attribute mutation), matching the convention established in item_service: the
async Unit-of-Work does not reliably flush Numeric attribute changes.
"""

from __future__ import annotations

import random
import uuid
from collections.abc import Sequence
from datetime import UTC, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy import update as sql_update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.models.card_state import CardState
from app.models.item import Item
from app.models.item_tag import ItemTag
from app.models.item_topic_link import ItemTopicLink
from app.models.item_version import ItemVersion
from app.models.practice_session import PracticeSession
from app.models.response import Response
from app.models.review_log import ReviewLog
from app.models.theta_history import ThetaHistory
from app.models.topic import Topic
from app.models.user import User
from app.models.user_theta import UserTheta
from app.models.user_topic_mastery import UserTopicMastery
from app.services import fsrs as fsrs_engine
from app.services import irt as irt_engine

# ---------------------------------------------------------------------------
# Exam scoring (negative marking)
# ---------------------------------------------------------------------------
# The fraction of a correct answer deducted per WRONG answer when computing an
# exam-style raw score. Blanks/skips are never penalised. This is a *reporting*
# figure only — it never feeds IRT θ estimation or FSRS scheduling, matching the
# standard separation of psychometrics from exam scoring.
#
# TUS deducts a quarter point per wrong answer ("doğru sayısından yanlışların
# dörtte biri düşülür"). Other exams default to 0.0 (no penalty).
PENALTY_PER_WRONG: dict[str, float] = {
    "tus": 0.25,
}


def penalty_for_exam(exam_type: str | None) -> float:
    return PENALTY_PER_WRONG.get(exam_type or "", 0.0)


# ---------------------------------------------------------------------------
# Mixed study queue (spaced repetition + new-card budgeting)
# ---------------------------------------------------------------------------
# Anki-style daily cap on how many brand-new cards a student is introduced to per
# day (counted across all topics). Due review/relearning cards are NEVER capped —
# the FSRS scheduler decides when those must be seen. The cap only throttles *new*
# material so a normal adaptive session blends new questions, due reviews, and
# re-learning cards together instead of burying reviews under an unbounded flood
# of new questions. The day boundary is the learner's local midnight (their
# stored timezone; see `_user_tz`), not UTC.
NEW_CARDS_PER_DAY: int = 20


# Cold-start seed: a brand-new learner (no graded responses yet) has no measured
# θ, so we select their first questions from the ability implied by their own
# self-assessment. The instant they answer anything, EAP-measured θ replaces this
# — the seed is never persisted and never overrides real data. Midpoints chosen to
# match the _ability_level bands (<-0.5 beginner, <0.5 developing, <1.5 proficient).
_SELF_RATED_THETA: dict[str, float] = {
    "beginner": -1.0,
    "developing": 0.0,
    "proficient": 1.0,
    "advanced": 2.0,
}


# ---------------------------------------------------------------------------
# Session loading + scope helpers
# ---------------------------------------------------------------------------


async def _load_session(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID
) -> PracticeSession:
    result = await db.execute(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise NotFoundError(f"Practice session '{session_id}' not found.")
    if session.user_id != user_id:
        raise ForbiddenError("This practice session belongs to another user.")
    return session


def _scope(
    session: PracticeSession,
) -> tuple[str | None, str | None, list[uuid.UUID] | None]:
    """Extract (exam_type, exam_part, topic_ids) scope from the session metadata.

    ``topic_ids`` is a list so a daily review can span several chosen collections;
    ``None`` means "no topic restriction" (all in-scope items). A legacy
    single-``topic_id`` session is read transparently as a one-element list.
    """
    meta = session.client_metadata or {}
    exam_type = meta.get("exam_type")
    exam_part = meta.get("exam_part")
    topic_ids_raw = meta.get("topic_ids")
    if topic_ids_raw:
        topic_ids = [uuid.UUID(t) for t in topic_ids_raw]
    else:
        single = meta.get("topic_id")
        topic_ids = [uuid.UUID(single)] if single else None
    return exam_type, exam_part, topic_ids


def _daily_config(session: PracticeSession) -> dict:
    """Daily-review budget + cold-start settings stored in the session metadata."""
    meta = session.client_metadata or {}
    return {
        "limit_type": meta.get("limit_type"),
        "time_limit_minutes": meta.get("time_limit_minutes"),
        "self_rated_level": meta.get("self_rated_level"),
    }


def _selection_topic(
    session: PracticeSession, topic_ids: list[uuid.UUID] | None
) -> uuid.UUID | None:
    """Which θ scope drives adaptive selection.

    A session pinned to exactly one collection (and not a daily review) selects
    from that collection's per-topic ability; a daily review or any multi-topic /
    unrestricted session selects from the global ability.
    """
    if session.session_type == "daily_review":
        return None
    if topic_ids and len(topic_ids) == 1:
        return topic_ids[0]
    return None


# ---------------------------------------------------------------------------
# Ability (theta) helpers
# ---------------------------------------------------------------------------


async def _get_or_create_theta(
    db: AsyncSession,
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    topic_id: uuid.UUID | None,
) -> UserTheta:
    """Fetch the user's θ row for a scope (topic_id=None means global), creating it."""
    stmt = select(UserTheta).where(UserTheta.user_id == user_id)
    stmt = stmt.where(
        UserTheta.topic_id.is_(None) if topic_id is None else UserTheta.topic_id == topic_id
    )
    row = (await db.execute(stmt)).scalar_one_or_none()
    if row is None:
        row = UserTheta(
            user_id=user_id,
            institution_id=institution_id,
            topic_id=topic_id,
            theta=0.0,
            theta_se=1.0,
            responses_used=0,
        )
        db.add(row)
        await db.flush()
    return row


async def _collect_response_points(
    db: AsyncSession,
    user_id: uuid.UUID,
    topic_id: uuid.UUID | None,
) -> list[irt_engine.ResponsePoint]:
    """
    Gather all graded (non-skipped) responses for EAP, scoped globally or to a
    topic. Item IRT parameters default to neutral values for uncalibrated items.
    """
    stmt = (
        select(Item.irt_a, Item.irt_b, Response.is_correct)
        .join(Item, Item.id == Response.item_id)
        .where(
            Response.user_id == user_id,
            Response.is_correct.is_not(None),
            Response.was_skipped.is_(False),
        )
    )
    if topic_id is not None:
        stmt = stmt.join(
            ItemTopicLink,
            (ItemTopicLink.item_id == Item.id) & (ItemTopicLink.is_primary.is_(True)),
        ).where(ItemTopicLink.topic_id == topic_id)

    rows = (await db.execute(stmt)).all()
    return [
        irt_engine.ResponsePoint(
            a=float(a) if a is not None else irt_engine.DEFAULT_A,
            b=float(b) if b is not None else irt_engine.DEFAULT_B,
            correct=bool(correct),
        )
        for (a, b, correct) in rows
    ]


async def _recompute_theta(
    db: AsyncSession,
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    topic_id: uuid.UUID | None,
    trigger_response_id: int | None,
) -> irt_engine.ThetaEstimate:
    """Recompute EAP θ over the user's full (scoped) history and persist it."""
    row = await _get_or_create_theta(db, user_id, institution_id, topic_id)
    points = await _collect_response_points(db, user_id, topic_id)
    est = irt_engine.estimate_theta_eap(points)

    await db.execute(
        sql_update(UserTheta)
        .where(UserTheta.id == row.id)
        .values(theta=est.theta, theta_se=est.se, responses_used=est.n_responses)
    )
    db.add(
        ThetaHistory(
            user_id=user_id,
            institution_id=institution_id,
            topic_id=topic_id,
            theta=est.theta,
            theta_se=est.se,
            responses_used=est.n_responses,
            trigger_response_id=trigger_response_id,
        )
    )
    return est


# ---------------------------------------------------------------------------
# Candidate item loading + IRT selection
# ---------------------------------------------------------------------------


async def _load_item_full(db: AsyncSession, item_id: uuid.UUID) -> Item | None:
    result = await db.execute(
        select(Item)
        .options(
            selectinload(Item.current_version).selectinload(ItemVersion.options),
            selectinload(Item.item_topic_links),
        )
        .where(Item.id == item_id, Item.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()


async def _candidate_items(
    db: AsyncSession,
    session: PracticeSession,
    exam_type: str | None,
    exam_part: str | None,
    topic_ids: list[uuid.UUID] | None,
    review_only: bool,
) -> list[Item]:
    """
    Items eligible to be served next: active, in-scope, in this institution, with
    a usable current version, excluding anything already answered this session.
    Review sessions further restrict to cards that are currently due.
    """
    answered_subq = (
        select(Response.item_id)
        .where(Response.session_id == session.id)
        .scalar_subquery()
    )

    stmt = (
        select(Item)
        .options(
            selectinload(Item.current_version).selectinload(ItemVersion.options),
            selectinload(Item.item_topic_links),
        )
        .where(
            Item.institution_id == session.institution_id,
            Item.status == "active",
            Item.deleted_at.is_(None),
            Item.current_version_id.is_not(None),
            Item.id.not_in(answered_subq),
        )
    )
    if exam_type:
        stmt = stmt.where(Item.exam_type == exam_type)
    if exam_part:
        stmt = stmt.where(Item.exam_part == exam_part)
    if topic_ids:
        stmt = stmt.join(
            ItemTopicLink,
            (ItemTopicLink.item_id == Item.id) & (ItemTopicLink.is_primary.is_(True)),
        ).where(ItemTopicLink.topic_id.in_(topic_ids))
    if review_only:
        now = datetime.now(UTC)
        stmt = stmt.join(
            CardState,
            (CardState.item_id == Item.id) & (CardState.user_id == session.user_id),
        ).where(CardState.due_at.is_not(None), CardState.due_at <= now)

    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


def _primary_topic_id(item: Item) -> uuid.UUID | None:
    for link in item.item_topic_links or []:
        if link.is_primary:
            return link.topic_id
    return None


def _resolve_tz(tz_name: str | None) -> ZoneInfo:
    """The learner's IANA timezone, falling back to UTC for unset/invalid names."""
    if tz_name:
        try:
            return ZoneInfo(tz_name)
        except Exception:
            pass
    return ZoneInfo("UTC")


def _local_day_start_utc(now: datetime, tz: ZoneInfo) -> datetime:
    """UTC instant of the most recent local midnight in ``tz`` — so "today" means
    the learner's calendar day, not the UTC day."""
    local = now.astimezone(tz)
    return datetime(local.year, local.month, local.day, tzinfo=tz).astimezone(UTC)


async def _user_tz(db: AsyncSession, user_id: uuid.UUID) -> ZoneInfo:
    tz_name = await db.scalar(select(User.timezone).where(User.id == user_id))
    return _resolve_tz(tz_name)


async def _new_cards_remaining_today(
    db: AsyncSession, user_id: uuid.UUID, now: datetime
) -> int:
    """How many more brand-new cards the student may be introduced to today.

    Each brand-new card writes exactly one ReviewLog with ``state_before == 'new'``
    on its first review, so counting those rows since the start of the learner's
    local day is an exact count of new cards already introduced today.
    """
    start_of_day = _local_day_start_utc(now, await _user_tz(db, user_id))
    introduced = await db.scalar(
        select(func.count())
        .select_from(ReviewLog)
        .where(
            ReviewLog.user_id == user_id,
            ReviewLog.state_before == "new",
            ReviewLog.reviewed_at >= start_of_day,
        )
    )
    # The learner's own per-day new-card budget (profile setting). Falls back to
    # the module default for any row that predates the preference.
    cap = await db.scalar(select(User.daily_new_cards_cap).where(User.id == user_id))
    daily_cap = int(cap) if cap is not None else NEW_CARDS_PER_DAY
    return max(daily_cap - int(introduced or 0), 0)


async def _mixed_study_pool(
    db: AsyncSession,
    session: PracticeSession,
    candidates: list[Item],
) -> list[Item]:
    """Assemble the pool of items eligible to be served *right now* for a normal
    (non-review) adaptive session, blending three buckets into one mixed queue:

      1. **Due cards** (review + relearning + any due learning) are always
         eligible — the FSRS scheduler says they need to be seen now.
      2. **New cards** (no card state yet) are eligible only while the daily
         new-card budget is not exhausted, so new material is interleaved with
         reviews rather than crowding them out.
      3. If nothing is due and the new budget is spent, fall back to **not-yet-due**
         cards so the session can still practise ahead instead of dead-ending.

    The caller then runs IRT maximum-information selection over whatever pool this
    returns, so *which* eligible item is served still adapts to ability.
    """
    now = datetime.now(UTC)
    item_ids = [c.id for c in candidates]
    rows = (
        await db.execute(
            select(CardState.item_id, CardState.due_at).where(
                CardState.user_id == session.user_id,
                CardState.item_id.in_(item_ids),
            )
        )
    ).all()
    due_by_item: dict[uuid.UUID, datetime | None] = dict(rows)

    due: list[Item] = []
    new: list[Item] = []
    not_due: list[Item] = []
    for c in candidates:
        if c.id not in due_by_item:
            new.append(c)  # never reviewed => brand-new card
            continue
        due_at = due_by_item[c.id]
        if due_at is not None and due_at <= now:
            due.append(c)
        else:
            not_due.append(c)

    allowed_new: list[Item] = []
    if new and await _new_cards_remaining_today(db, session.user_id, now) > 0:
        allowed_new = new

    eligible = due + allowed_new
    return eligible or not_due


def _item_irt(item: Item) -> tuple[float, float]:
    """An item's (a, b) IRT parameters, defaulting uncalibrated items to neutral."""
    a = float(item.irt_a) if item.irt_a is not None else irt_engine.DEFAULT_A
    b = float(item.irt_b) if item.irt_b is not None else irt_engine.DEFAULT_B
    return a, b


def _pick_max_info(pool: list[Item], theta: float) -> tuple[Item, float]:
    """Maximum-Fisher-information pick at ``theta``.

    When several items tie on information — the case while items are uncalibrated
    (all default a=1, b=0) — the tie is broken RANDOMLY so the learner gets variety
    rather than the same question every session. Once items are calibrated their
    information differs and the max genuinely adapts to ability.
    """
    scored = [(item, irt_engine.fisher_information(theta, *_item_irt(item))) for item in pool]
    max_info = max(s for _, s in scored)
    top = [item for item, s in scored if s >= max_info - 1e-9]
    chosen = random.choice(top)
    return chosen, irt_engine.fisher_information(theta, *_item_irt(chosen))


async def _select_daily_review(
    db: AsyncSession,
    session: PracticeSession,
    candidates: list[Item],
    selection_theta: float,
) -> tuple[Item | None, float]:
    """Pick the single best question for a daily-review session right now.

    The two engines play distinct, non-overlapping roles — this is the heart of
    "best question at the best time" for a *learning* tool (not an adaptive exam):

      1. **Due / re-learning cards win, most-overdue first.** For material already
         in memory the goal is retention, so FSRS urgency (how overdue the card is)
         decides — not psychometric information. Ordering by ``due_at`` ascending
         surfaces the card closest to being forgotten first.
      2. **Otherwise a new card, IRT difficulty-matched.** When nothing is due we
         introduce new material (capped per day), and here IRT *does* lead: pick the
         item whose difficulty best matches the learner's ability so it is neither
         trivial nor hopeless.
      3. **Nothing due and no new budget → done for today.** A daily review is the
         day's workload; we deliberately do NOT practise ahead into not-yet-due
         cards (that would never let the learner finish and would blur the daily
         loop). Returning ``None`` ends the session cleanly.
    """
    now = datetime.now(UTC)
    item_ids = [c.id for c in candidates]
    rows = (
        await db.execute(
            select(CardState.item_id, CardState.due_at).where(
                CardState.user_id == session.user_id,
                CardState.item_id.in_(item_ids),
            )
        )
    ).all()
    due_by_item: dict[uuid.UUID, datetime | None] = dict(rows)

    due: list[Item] = []
    new: list[Item] = []
    for c in candidates:
        if c.id not in due_by_item:
            new.append(c)  # never reviewed => brand-new card
            continue
        due_at = due_by_item[c.id]
        if due_at is not None and due_at <= now:
            due.append(c)
        # not-yet-due cards are intentionally ignored (no practise-ahead).

    # 1. Due cards — most overdue (earliest due_at) first; id breaks exact ties.
    if due:
        due.sort(key=lambda it: (due_by_item[it.id], str(it.id)))
        chosen = due[0]
        return chosen, irt_engine.fisher_information(selection_theta, *_item_irt(chosen))

    # 2. New cards within the daily budget — IRT difficulty-matched.
    if new and await _new_cards_remaining_today(db, session.user_id, now) > 0:
        return _pick_max_info(new, selection_theta)

    # 3. Caught up for today.
    return None, 0.0


# ---------------------------------------------------------------------------
# Public API: start / next / answer / finish
# ---------------------------------------------------------------------------


async def start_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    *,
    session_type: str,
    exam_type: str | None,
    exam_part: str | None,
    topic_id: uuid.UUID | None,
    items_target: int | None,
    device_type: str | None,
    topic_ids: list[uuid.UUID] | None = None,
    limit_type: str | None = None,
    time_limit_minutes: int | None = None,
    self_rated_level: str | None = None,
) -> PracticeSession:
    meta: dict = {
        "exam_type": exam_type,
        "exam_part": exam_part,
        "topic_id": str(topic_id) if topic_id else None,
    }
    if topic_ids:
        meta["topic_ids"] = [str(t) for t in topic_ids]
    if limit_type:
        meta["limit_type"] = limit_type
    if time_limit_minutes:
        meta["time_limit_minutes"] = time_limit_minutes
    if self_rated_level:
        meta["self_rated_level"] = self_rated_level

    # θ_start is the ability we adapt from. A daily review or any multi-topic
    # session adapts from the global θ; a single-topic session from that topic's θ.
    scope_topic = topic_id if (topic_id and session_type != "daily_review") else None
    if session_type == "daily_review":
        scope_topic = None
    scope_theta = await _get_or_create_theta(db, user_id, institution_id, scope_topic)

    # A time-budgeted daily review has no fixed question count; clear items_target
    # so the server enforces the wall-clock budget instead of a count it never met.
    if session_type == "daily_review" and limit_type == "time":
        items_target = None

    session = PracticeSession(
        user_id=user_id,
        institution_id=institution_id,
        session_type=session_type,
        status="in_progress",
        items_target=items_target,
        items_delivered=0,
        items_correct=0,
        theta_start=float(scope_theta.theta),
        device_type=device_type,
        client_metadata=meta,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_next_item(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
) -> tuple[PracticeSession, Item | None, float, float]:
    """
    Return (session, chosen_item | None, selection_theta, fisher_information).

    The chosen item maximises Fisher information at the scope's current θ.
    """
    session = await _load_session(db, session_id, user_id)
    if session.status != "in_progress":
        raise BadRequestError("This session is no longer active.")

    exam_type, exam_part, topic_ids = _scope(session)
    is_daily = session.session_type == "daily_review"
    review_only = session.session_type == "review"

    scope_theta_row = await _get_or_create_theta(
        db, user_id, session.institution_id, _selection_topic(session, topic_ids)
    )
    selection_theta = float(scope_theta_row.theta)

    # Daily review: enforce the budget server-side (a soft stop — the question in
    # hand always finishes; we just stop handing out new ones) and seed θ for a
    # brand-new learner from their self-assessment until real data exists.
    if is_daily:
        cfg = _daily_config(session)
        if session.items_target is not None and session.items_delivered >= session.items_target:
            return session, None, selection_theta, 0.0
        tl = cfg["time_limit_minutes"]
        if cfg["limit_type"] == "time" and tl:
            elapsed = (datetime.now(UTC) - session.started_at).total_seconds()
            if elapsed >= int(tl) * 60:
                return session, None, selection_theta, 0.0
        if scope_theta_row.responses_used == 0:
            seeded = _SELF_RATED_THETA.get(cfg["self_rated_level"] or "")
            if seeded is not None:
                selection_theta = seeded

    candidates = await _candidate_items(
        db,
        session,
        exam_type=exam_type,
        exam_part=exam_part,
        topic_ids=topic_ids,
        review_only=review_only,
    )
    if not candidates:
        return session, None, selection_theta, 0.0

    # Daily review uses a hybrid selector: FSRS urgency for due/re-learning cards,
    # IRT difficulty-matching for new ones, and "done for today" once both are
    # exhausted (see _select_daily_review).
    if is_daily:
        chosen, info = await _select_daily_review(db, session, candidates, selection_theta)
        return session, chosen, selection_theta, info

    # Other modes: a "review" session is already restricted to due cards, so every
    # candidate is eligible; a normal adaptive session blends due reviews, due
    # re-learning, and a daily-capped trickle of new cards into one mixed queue.
    if review_only:
        pool = candidates
    else:
        pool = await _mixed_study_pool(db, session, candidates)
    if not pool:
        return session, None, selection_theta, 0.0

    chosen, info = _pick_max_info(pool, selection_theta)
    return session, chosen, selection_theta, info


async def exam_paper(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
    count: int | None = None,
) -> list[Item]:
    """
    Draw the exam paper — every question in the session's scope, fetched up front
    so the student sees and moves between all of them like a real exam sheet. A
    real exam shows the whole paper, so ``count`` is normally ``None`` (all
    in-scope questions); a positive ``count`` caps it for shorter mock papers.

    Order follows the real exam: questions are sorted by their official number
    (the ``q_no`` provenance tag, e.g. "2013-TUS İlkbahar / TTBT#1"), so the paper
    reads 1, 2, 3 … exactly like the source exam. Items without a number sort last.
    No correctness is included.
    """
    session = await _load_session(db, session_id, user_id)
    if session.status != "in_progress":
        raise BadRequestError("This session is no longer active.")

    exam_type, exam_part, topic_ids = _scope(session)
    candidates = await _candidate_items(
        db,
        session,
        exam_type=exam_type,
        exam_part=exam_part,
        topic_ids=topic_ids,
        review_only=False,
    )
    if not candidates:
        return []

    # Real exam order: parse the official question number from the q_no tag.
    tag_rows = (
        await db.execute(
            select(ItemTag.item_id, ItemTag.tag_value).where(
                ItemTag.tag_key == "q_no",
                ItemTag.item_id.in_([c.id for c in candidates]),
            )
        )
    ).all()
    qno_by_item: dict[uuid.UUID, int] = {}
    for item_id, value in tag_rows:
        try:
            qno_by_item[item_id] = int(value.rsplit("#", 1)[-1])
        except (ValueError, AttributeError):
            continue

    # Sort by official number; unnumbered items fall to the end (stable by id).
    unnumbered = 10**9
    ordered = sorted(
        candidates,
        key=lambda it: (qno_by_item.get(it.id, unnumbered), str(it.id)),
    )
    if count is None:
        return ordered
    return ordered[: max(count, 1)]


async def _grade_one(
    db: AsyncSession,
    session: PracticeSession,
    user_id: uuid.UUID,
    *,
    item_id: uuid.UUID,
    selected_option_id: uuid.UUID | None,
    response_time_ms: int | None,
    was_skipped: bool,
    is_timed_out: bool,
) -> dict:
    """Grade a single answer against an already-loaded, in-progress session and run
    the full IRT + FSRS update cascade. Flushes its writes but does NOT commit, so a
    caller can grade one answer or a whole batch inside a single transaction. Mutates
    the in-memory ``session`` counters so successive calls in a batch accumulate."""
    item = await _load_item_full(db, item_id)
    if item is None or item.institution_id != session.institution_id:
        raise NotFoundError(f"Item '{item_id}' not found in this session's scope.")
    if item.current_version is None:
        raise BadRequestError("Item has no current version to answer.")

    options = item.current_version.options
    correct_option = next((o for o in options if o.is_correct), None)
    primary_topic_id = _primary_topic_id(item)

    # --- Grade -------------------------------------------------------------
    if was_skipped or selected_option_id is None:
        was_skipped = True
        is_correct: bool | None = None
    else:
        if not any(o.id == selected_option_id for o in options):
            raise BadRequestError("Selected option does not belong to this item.")
        is_correct = bool(correct_option is not None and selected_option_id == correct_option.id)

    # θ before (captured before recompute) for both scopes.
    global_theta_row = await _get_or_create_theta(db, user_id, session.institution_id, None)
    theta_before = float(global_theta_row.theta)
    topic_theta_before: float | None = None
    if primary_topic_id is not None:
        topic_row = await _get_or_create_theta(
            db, user_id, session.institution_id, primary_topic_id
        )
        topic_theta_before = float(topic_row.theta)

    # --- Persist the response ---------------------------------------------
    rating = None
    if not was_skipped:
        avg_ms = item.avg_response_time_ms
        rating = fsrs_engine.rating_from_response(
            is_correct=bool(is_correct),
            response_time_ms=response_time_ms,
            item_avg_ms=avg_ms,
        )

    response = Response(
        user_id=user_id,
        institution_id=session.institution_id,
        item_id=item.id,
        item_version_id=item.current_version_id,
        session_id=session.id,
        primary_topic_id=primary_topic_id,
        selected_option_id=selected_option_id if not was_skipped else None,
        is_correct=is_correct,
        response_time_ms=response_time_ms,
        theta_at_response=theta_before,
        theta_domain_at_response=topic_theta_before,
        fsrs_rating=int(rating) if rating is not None else None,
        is_timed_out=is_timed_out,
        was_skipped=was_skipped,
    )
    db.add(response)
    await db.flush()  # response.id now available, and it is part of θ history

    # --- FSRS card update (skips do not touch memory state) ----------------
    card_out: fsrs_engine.ScheduleResult | None = None
    card_row: CardState | None = None
    if not was_skipped:
        card_out, card_row = await _apply_card_review(
            db,
            user_id=user_id,
            institution_id=session.institution_id,
            item_id=item.id,
            rating=rating,
            response_id=response.id,
            session_id=session.id,
        )

    # --- IRT θ recompute (skips carry no ability information) ---------------
    theta_after = theta_before
    theta_se_after = float(global_theta_row.theta_se)
    topic_theta_after = topic_theta_before
    if not was_skipped:
        global_est = await _recompute_theta(
            db, user_id, session.institution_id, None, response.id
        )
        theta_after = global_est.theta
        theta_se_after = global_est.se
        if primary_topic_id is not None:
            topic_est = await _recompute_theta(
                db, user_id, session.institution_id, primary_topic_id, response.id
            )
            topic_theta_after = topic_est.theta

    # --- Session counters --------------------------------------------------
    items_delivered = session.items_delivered + 1
    items_correct = session.items_correct + (1 if is_correct else 0)
    items_skipped = session.items_skipped + (1 if was_skipped else 0)
    score_percent = round(100.0 * items_correct / items_delivered, 2)
    await db.execute(
        sql_update(PracticeSession)
        .where(PracticeSession.id == session.id)
        .values(
            items_delivered=items_delivered,
            items_correct=items_correct,
            items_skipped=items_skipped,
            score_percent=score_percent,
            theta_end=theta_after,
        )
    )
    # Keep the in-memory session in sync so a bulk loop reads fresh counters/θ
    # on the next answer (the Core UPDATE above does not refresh the ORM object).
    session.items_delivered = items_delivered
    session.items_correct = items_correct
    session.items_skipped = items_skipped
    session.score_percent = score_percent
    session.theta_end = theta_after

    # --- Per-topic mastery rollup -----------------------------------------
    if primary_topic_id is not None and not was_skipped:
        await _update_mastery(
            db,
            user_id=user_id,
            topic_id=primary_topic_id,
            is_correct=bool(is_correct),
            response_time_ms=response_time_ms,
            topic_theta=topic_theta_after,
        )

    return {
        "response_id": response.id,
        "item_id": item.id,
        "is_correct": bool(is_correct) if is_correct is not None else False,
        "was_skipped": was_skipped,
        "correct_option_id": correct_option.id if correct_option else None,
        "explanation": (correct_option.explanation if correct_option else None)
        or item.current_version.explanation,
        "theta_before": theta_before,
        "theta_after": theta_after,
        "theta_se_after": theta_se_after,
        "topic_theta_after": topic_theta_after,
        "card": card_out,
        "card_row": card_row,
        "items_delivered": items_delivered,
        "items_correct": items_correct,
    }


async def submit_answer(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
    *,
    item_id: uuid.UUID,
    selected_option_id: uuid.UUID | None,
    response_time_ms: int | None,
    was_skipped: bool,
    is_timed_out: bool,
) -> dict:
    """Grade a single answer and commit. Returns a dict consumed by the endpoint."""
    session = await _load_session(db, session_id, user_id)
    if session.status != "in_progress":
        raise BadRequestError("This session is no longer active.")
    result = await _grade_one(
        db,
        session,
        user_id,
        item_id=item_id,
        selected_option_id=selected_option_id,
        response_time_ms=response_time_ms,
        was_skipped=was_skipped,
        is_timed_out=is_timed_out,
    )
    await db.commit()
    return result


async def submit_answers_bulk(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
    *,
    answers: Sequence[Any],
) -> list[dict]:
    """Grade a batch of answers for one session inside a single transaction, then
    commit once. The per-answer IRT/FSRS cascade is identical to the one-shot path;
    the session row is kept fresh in-memory between answers so counters and θ
    accumulate correctly. One commit replaces N round-trips and N commits, and the
    batch is all-or-nothing — a failure rolls back the whole submission rather than
    leaving the session half-submitted. ``answers`` items are duck-typed against the
    ``AnswerSubmitRequest`` fields."""
    session = await _load_session(db, session_id, user_id)
    if session.status != "in_progress":
        raise BadRequestError("This session is no longer active.")
    results: list[dict] = []
    for a in answers:
        results.append(
            await _grade_one(
                db,
                session,
                user_id,
                item_id=a.item_id,
                selected_option_id=a.selected_option_id,
                response_time_ms=a.response_time_ms,
                was_skipped=a.was_skipped,
                is_timed_out=a.is_timed_out,
            )
        )
    await db.commit()
    return results


async def finish_session(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
) -> PracticeSession:
    session = await _load_session(db, session_id, user_id)
    if session.status == "completed":
        return session

    # Exam-style raw score with negative marking. Skips are excluded from the
    # penalty; only answered-wrong items are deducted. This figure is reporting
    # only — θ and FSRS state were already updated per-answer from binary outcomes.
    exam_type, _, _ = _scope(session)
    penalty = penalty_for_exam(exam_type)
    wrong = max(session.items_delivered - session.items_correct - session.items_skipped, 0)
    net_score = round(session.items_correct - wrong * penalty, 3)

    now = datetime.now(UTC)
    time_spent = int((now - session.started_at).total_seconds())
    await db.execute(
        sql_update(PracticeSession)
        .where(PracticeSession.id == session.id)
        .values(
            status="completed",
            completed_at=now,
            time_spent_seconds=time_spent,
            net_score=net_score,
            penalty_per_wrong=penalty,
        )
    )
    await db.commit()
    await db.refresh(session)
    return session


# ---------------------------------------------------------------------------
# FSRS persistence
# ---------------------------------------------------------------------------


async def _apply_card_review(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    item_id: uuid.UUID,
    rating,
    response_id: int,
    session_id: uuid.UUID,
) -> tuple[fsrs_engine.ScheduleResult, CardState]:
    """Advance (or create) the card for (user, item) and log the review."""
    now = datetime.now(UTC)
    existing = (
        await db.execute(
            select(CardState).where(
                CardState.user_id == user_id, CardState.item_id == item_id
            )
        )
    ).scalar_one_or_none()

    if existing is None:
        snap = fsrs_engine.new_card_snapshot()
    else:
        snap = fsrs_engine.CardSnapshot(
            state=existing.state,
            difficulty=float(existing.difficulty),
            stability=float(existing.stability),
            due_at=existing.due_at,
            last_review_at=existing.last_review_at,
            reps=existing.reps,
            lapses=existing.lapses,
            retrievability=(
                float(existing.retrievability)
                if existing.retrievability is not None
                else None
            ),
        )

    result = fsrs_engine.schedule_review(snap, rating, now=now)
    after = result.after

    if existing is None:
        card = CardState(
            user_id=user_id,
            item_id=item_id,
            institution_id=institution_id,
            state=after.state,
            difficulty=after.difficulty,
            stability=after.stability,
            due_at=after.due_at,
            last_review_at=after.last_review_at,
            reps=after.reps,
            lapses=after.lapses,
            retrievability=after.retrievability,
        )
        db.add(card)
    else:
        await db.execute(
            sql_update(CardState)
            .where(CardState.user_id == user_id, CardState.item_id == item_id)
            .values(
                state=after.state,
                difficulty=after.difficulty,
                stability=after.stability,
                due_at=after.due_at,
                last_review_at=after.last_review_at,
                reps=after.reps,
                lapses=after.lapses,
                retrievability=after.retrievability,
            )
        )
        card = existing

    db.add(
        ReviewLog(
            user_id=user_id,
            item_id=item_id,
            response_id=response_id,
            session_id=session_id,
            rating=result.rating,
            state_before=snap.state,
            difficulty_before=snap.difficulty,
            stability_before=snap.stability,
            state_after=after.state,
            difficulty_after=after.difficulty,
            stability_after=after.stability,
            scheduled_interval_days=result.scheduled_interval_days,
            elapsed_days=result.elapsed_days,
        )
    )
    return result, card


# ---------------------------------------------------------------------------
# Mastery rollup
# ---------------------------------------------------------------------------


def _mastery_level(total: int, accuracy: float, theta: float | None) -> str:
    if total == 0:
        return "not_started"
    if accuracy < 0.5:
        return "needs_review"
    if theta is None or theta < 0.5:
        return "developing"
    if theta < 1.5:
        return "proficient"
    return "mastered"


async def _update_mastery(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    topic_id: uuid.UUID,
    is_correct: bool,
    response_time_ms: int | None,
    topic_theta: float | None,
) -> None:
    existing = (
        await db.execute(
            select(UserTopicMastery).where(
                UserTopicMastery.user_id == user_id,
                UserTopicMastery.topic_id == topic_id,
            )
        )
    ).scalar_one_or_none()

    now = datetime.now(UTC)
    if existing is None:
        total = 1
        correct = 1 if is_correct else 0
        accuracy = correct / total
        db.add(
            UserTopicMastery(
                user_id=user_id,
                topic_id=topic_id,
                theta=topic_theta,
                mastery_level=_mastery_level(total, accuracy, topic_theta),
                total_responses=total,
                correct_responses=correct,
                accuracy_rate=accuracy,
                avg_response_time_ms=response_time_ms,
                first_response_at=now,
                last_response_at=now,
            )
        )
        return

    total = existing.total_responses + 1
    correct = existing.correct_responses + (1 if is_correct else 0)
    accuracy = correct / total
    await db.execute(
        sql_update(UserTopicMastery)
        .where(
            UserTopicMastery.user_id == user_id,
            UserTopicMastery.topic_id == topic_id,
        )
        .values(
            theta=topic_theta,
            mastery_level=_mastery_level(total, accuracy, topic_theta),
            total_responses=total,
            correct_responses=correct,
            accuracy_rate=accuracy,
            last_response_at=now,
        )
    )


# ---------------------------------------------------------------------------
# Study journey — per-category overview for the student dashboard
# ---------------------------------------------------------------------------


def _journey_state(answered: int, new_count: int, mastery_level: str) -> str:
    """Where the student stands on a category's learn → master → review arc."""
    if mastery_level == "mastered":
        return "mastered"
    if answered == 0:
        return "not_started"
    if new_count > 0:
        return "learning"
    return "reviewing"  # every question seen at least once, still consolidating


def _recommended_mode(new_count: int, due_count: int, mastery_level: str) -> str | None:
    """The primary action we steer the student toward for a category.

    Learn unseen questions first (unless already mastered), then clear anything
    the spaced-repetition scheduler says is due. ``None`` means "all caught up":
    nothing new to learn and nothing due to review right now.
    """
    if new_count > 0 and mastery_level != "mastered":
        return "adaptive_practice"
    if due_count > 0:
        return "review"
    if new_count > 0:
        return "adaptive_practice"
    return None


async def study_overview(
    db: AsyncSession,
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> list[dict]:
    """
    Build the per-category study-journey cards for one student.

    Only categories that actually contain answerable questions in this
    institution are returned. Each card blends three independent signals:
      * coverage  — how many questions are new (never attempted) vs answered,
      * FSRS      — how many cards are currently due for review,
      * IRT       — the student's per-topic ability θ and mastery rollup.
    """
    now = datetime.now(UTC)

    # 1. Answerable-question totals per topic (the universe of each category).
    totals_rows = (
        await db.execute(
            select(
                ItemTopicLink.topic_id,
                func.count().label("total"),
                func.min(Item.exam_type).label("exam_type"),
            )
            .join(Item, Item.id == ItemTopicLink.item_id)
            .where(
                ItemTopicLink.is_primary.is_(True),
                Item.institution_id == institution_id,
                Item.status == "active",
                Item.deleted_at.is_(None),
                Item.current_version_id.is_not(None),
            )
            .group_by(ItemTopicLink.topic_id)
        )
    ).all()
    if not totals_rows:
        return []

    totals = {r.topic_id: (r.total, r.exam_type) for r in totals_rows}
    topic_ids = list(totals.keys())

    # 2. Distinct questions the student has attempted, per topic.
    answered = dict(
        (
            await db.execute(
                select(
                    Response.primary_topic_id,
                    func.count(func.distinct(Response.item_id)),
                )
                .where(
                    Response.user_id == user_id,
                    Response.primary_topic_id.in_(topic_ids),
                )
                .group_by(Response.primary_topic_id)
            )
        ).all()
    )

    # 3. Cards currently due for review (FSRS), per topic.
    due = dict(
        (
            await db.execute(
                select(ItemTopicLink.topic_id, func.count())
                .join(
                    CardState,
                    (CardState.item_id == ItemTopicLink.item_id)
                    & (CardState.user_id == user_id),
                )
                .where(
                    ItemTopicLink.is_primary.is_(True),
                    ItemTopicLink.topic_id.in_(topic_ids),
                    CardState.due_at.is_not(None),
                    CardState.due_at <= now,
                )
                .group_by(ItemTopicLink.topic_id)
            )
        ).all()
    )

    # 4. Mastery rollup and 5. per-topic θ.
    mastery = {
        m.topic_id: m
        for m in (
            await db.execute(
                select(UserTopicMastery).where(
                    UserTopicMastery.user_id == user_id,
                    UserTopicMastery.topic_id.in_(topic_ids),
                )
            )
        ).scalars().all()
    }
    thetas = {
        t.topic_id: t
        for t in (
            await db.execute(
                select(UserTheta).where(
                    UserTheta.user_id == user_id,
                    UserTheta.topic_id.in_(topic_ids),
                )
            )
        ).scalars().all()
    }

    # 6. Topic names / levels.
    names = {
        tid: (name, level)
        for tid, name, level in (
            await db.execute(
                select(Topic.id, Topic.name, Topic.level).where(Topic.id.in_(topic_ids))
            )
        ).all()
    }

    cards: list[dict] = []
    for tid, (total, exam_type) in totals.items():
        ans = int(answered.get(tid, 0))
        new_count = max(total - ans, 0)
        due_count = int(due.get(tid, 0))
        m = mastery.get(tid)
        mastery_level = m.mastery_level if m else "not_started"
        accuracy_rate = (
            float(m.accuracy_rate) if m and m.accuracy_rate is not None else None
        )
        th = thetas.get(tid)
        topic_theta = float(th.theta) if th is not None else None
        name, level = names.get(tid, ("?", 0))

        cards.append(
            {
                "topic_id": tid,
                "topic_name": name,
                "level": level,
                "exam_type": exam_type,
                "total_questions": total,
                "answered": ans,
                "new_count": new_count,
                "due_count": due_count,
                "mastery_level": mastery_level,
                "topic_theta": topic_theta,
                "accuracy_rate": accuracy_rate,
                "journey_state": _journey_state(ans, new_count, mastery_level),
                "recommended_mode": _recommended_mode(
                    new_count, due_count, mastery_level
                ),
            }
        )

    # Surface the most actionable categories first: in-progress learning, then
    # due reviews, then untouched, then finished — alphabetical within each.
    order = {"learning": 0, "reviewing": 1, "not_started": 2, "mastered": 3}
    cards.sort(key=lambda c: (order.get(c["journey_state"], 9), c["topic_name"]))
    return cards


# ---------------------------------------------------------------------------
# Student home dashboard — one rich snapshot of the learner's whole state
# ---------------------------------------------------------------------------


def _ability_level(theta: float | None) -> str:
    if theta is None or theta < -0.5:
        return "beginner"
    if theta < 0.5:
        return "developing"
    if theta < 1.5:
        return "proficient"
    return "advanced"


async def student_dashboard(
    db: AsyncSession,
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
) -> dict:
    """Assemble the student's home dashboard: ability, totals, question-bank
    coverage, spaced-repetition workload, mastery rollup, study streak, recent
    activity, and the ability trend — everything in one snapshot."""
    now = datetime.now(UTC)
    tz = await _user_tz(db, user_id)
    tz_name = str(tz)
    today = now.astimezone(tz).date()

    async def _scalar(stmt) -> int:
        return int((await db.execute(stmt)).scalar_one())

    # --- Ability (global θ) ---
    gt = (
        await db.execute(
            select(UserTheta).where(
                UserTheta.user_id == user_id, UserTheta.topic_id.is_(None)
            )
        )
    ).scalar_one_or_none()
    theta = float(gt.theta) if gt is not None else None
    theta_se = float(gt.theta_se) if gt is not None else None

    # --- Totals ---
    answered = await _scalar(
        select(func.count())
        .select_from(Response)
        .where(Response.user_id == user_id, Response.is_correct.is_not(None))
    )
    correct = await _scalar(
        select(func.count())
        .select_from(Response)
        .where(Response.user_id == user_id, Response.is_correct.is_(True))
    )
    sessions = await _scalar(
        select(func.count())
        .select_from(PracticeSession)
        .where(
            PracticeSession.user_id == user_id,
            PracticeSession.status == "completed",
        )
    )

    # --- Question-bank coverage ---
    library_total = await _scalar(
        select(func.count())
        .select_from(Item)
        .where(
            Item.institution_id == institution_id,
            Item.status == "active",
            Item.deleted_at.is_(None),
            Item.current_version_id.is_not(None),
        )
    )
    library_seen = await _scalar(
        select(func.count(func.distinct(Response.item_id))).where(
            Response.user_id == user_id
        )
    )
    library_new = max(library_total - library_seen, 0)

    # --- Spaced-repetition workload ---
    due_now = await _scalar(
        select(func.count())
        .select_from(CardState)
        .where(
            CardState.user_id == user_id,
            CardState.due_at.is_not(None),
            CardState.due_at <= now,
        )
    )
    state_counts = dict(
        (
            await db.execute(
                select(CardState.state, func.count())
                .where(CardState.user_id == user_id)
                .group_by(CardState.state)
            )
        ).all()
    )
    cards_learning = int(state_counts.get("learning", 0)) + int(
        state_counts.get("relearning", 0)
    )
    cards_review = int(state_counts.get("review", 0))

    # --- Mastery distribution ---
    mastery = {
        lvl: int(c)
        for lvl, c in (
            await db.execute(
                select(UserTopicMastery.mastery_level, func.count())
                .where(UserTopicMastery.user_id == user_id)
                .group_by(UserTopicMastery.mastery_level)
            )
        ).all()
    }
    topics_active = sum(mastery.values())
    topics_mastered = mastery.get("mastered", 0)

    # --- Strongest / focus subject (by accuracy, attempted only) ---
    masteries = (
        await db.execute(
            select(UserTopicMastery, Topic.name)
            .join(Topic, Topic.id == UserTopicMastery.topic_id)
            .where(
                UserTopicMastery.user_id == user_id,
                UserTopicMastery.total_responses > 0,
                UserTopicMastery.accuracy_rate.is_not(None),
            )
        )
    ).all()
    strongest = focus = None
    if masteries:
        ranked = sorted(masteries, key=lambda mn: float(mn[0].accuracy_rate))
        fm, fname = ranked[0]
        sm, sname = ranked[-1]
        focus = {
            "topic_id": fm.topic_id,
            "topic_name": fname,
            "accuracy_rate": float(fm.accuracy_rate),
        }
        strongest = {
            "topic_id": sm.topic_id,
            "topic_name": sname,
            "accuracy_rate": float(sm.accuracy_rate),
        }

    # --- Activity (last 14 days, in the learner's local timezone) ---
    day = func.date(func.timezone(tz_name, Response.created_at))
    since = now - timedelta(days=14)
    act_map = {
        str(d): int(c)
        for d, c in (
            await db.execute(
                select(day, func.count())
                .where(Response.user_id == user_id, Response.created_at >= since)
                .group_by(day)
            )
        ).all()
    }
    activity = [
        {
            "date": (today - timedelta(days=i)).isoformat(),
            "count": act_map.get((today - timedelta(days=i)).isoformat(), 0),
        }
        for i in range(13, -1, -1)
    ]

    # --- Study streak (consecutive active days ending today or yesterday) ---
    active_dates = {
        str(r[0])
        for r in (
            await db.execute(
                select(
                    func.distinct(func.date(func.timezone(tz_name, Response.created_at)))
                ).where(Response.user_id == user_id)
            )
        ).all()
    }
    streak = 0
    cursor = today if today.isoformat() in active_dates else today - timedelta(days=1)
    while cursor.isoformat() in active_dates:
        streak += 1
        cursor = cursor - timedelta(days=1)

    # --- Ability trend (global θ, oldest→newest, last 20) ---
    trend_rows = (
        await db.execute(
            select(ThetaHistory.created_at, ThetaHistory.theta)
            .where(ThetaHistory.user_id == user_id, ThetaHistory.topic_id.is_(None))
            .order_by(ThetaHistory.created_at.desc())
            .limit(20)
        )
    ).all()
    theta_trend = [{"at": at, "theta": float(th)} for at, th in reversed(trend_rows)]

    # --- Recent sessions ---
    recent = list(
        (
            await db.execute(
                select(PracticeSession)
                .where(PracticeSession.user_id == user_id)
                .order_by(PracticeSession.started_at.desc())
                .limit(5)
            )
        ).scalars().all()
    )

    return {
        "theta": theta,
        "theta_se": theta_se,
        "level": _ability_level(theta),
        "answered": answered,
        "correct": correct,
        "accuracy": (correct / answered if answered else None),
        "sessions": sessions,
        "library_total": library_total,
        "library_seen": library_seen,
        "library_new": library_new,
        "due_now": due_now,
        "cards_learning": cards_learning,
        "cards_review": cards_review,
        "topics_active": topics_active,
        "topics_mastered": topics_mastered,
        "mastery": mastery,
        "streak_days": streak,
        "activity": activity,
        "theta_trend": theta_trend,
        "strongest": strongest,
        "focus": focus,
        "recent_sessions": recent,
    }

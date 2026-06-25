"""
Practice-session endpoints — the student-facing adaptive engine.

Flow:
    POST   /sessions                 start a session (scoped to exam/topic)
    GET    /sessions/{id}            session state
    GET    /sessions/{id}/next       next adaptively-selected question
    POST   /sessions/{id}/answer     submit an answer -> IRT + FSRS cascade
    POST   /sessions/{id}/finish     close the session, return summary

All endpoints require an authenticated user with institution context. A session
is private to the user who started it (enforced in the service layer).
"""

import uuid
from collections import Counter
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, get_db
from app.core.exceptions import ForbiddenError
from app.schemas.practice import (
    AnswerResultOut,
    AnswerSubmitRequest,
    BulkAnswerResultOut,
    BulkAnswerSubmitRequest,
    CardScheduleOut,
    ExamItemOut,
    ExamPaperOut,
    NextItemOut,
    NextOptionOut,
    NoMoreItems,
    SessionOut,
    SessionStartRequest,
    SessionSummaryOut,
    StimulusOut,
)
from app.services import practice_service

router = APIRouter(prefix="/sessions", tags=["Practice"])

CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


def _require_institution(current_user: CurrentUser) -> uuid.UUID:
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required for practice sessions.")
    return current_user.institution_id


def _stimulus_out(item, total_in_group: int | None = None) -> StimulusOut | None:
    """Build the shared-passage payload for a question, or None if it has none."""
    s = item.stimulus
    if s is None:
        return None
    return StimulusOut(
        id=s.id,
        content=s.content,
        image_url=practice_service.first_image_url_media(s.media_attachments),
        group_no=s.group_no,
        order_in_group=item.stimulus_order,
        total_in_group=total_in_group,
    )


def _session_out(session) -> SessionOut:
    meta = session.client_metadata or {}
    return SessionOut(
        id=session.id,
        session_type=session.session_type,
        status=session.status,
        exam_type_scope=meta.get("exam_type"),
        exam_part_scope=meta.get("exam_part"),
        topic_scope=meta.get("topic_id"),
        limit_type=meta.get("limit_type"),
        time_limit_minutes=meta.get("time_limit_minutes"),
        items_target=session.items_target,
        items_delivered=session.items_delivered,
        items_correct=session.items_correct,
        score_percent=float(session.score_percent) if session.score_percent is not None else None,
        theta_start=float(session.theta_start) if session.theta_start is not None else None,
        theta_end=float(session.theta_end) if session.theta_end is not None else None,
        started_at=session.started_at,
        completed_at=session.completed_at,
    )


# ---------------------------------------------------------------------------
# POST /sessions — start
# ---------------------------------------------------------------------------


@router.post("", response_model=SessionOut, status_code=201, include_in_schema=False)
@router.post("/", response_model=SessionOut, status_code=201)
async def start_session(
    data: SessionStartRequest,
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> SessionOut:
    institution_id = _require_institution(current_user)
    session = await practice_service.start_session(
        db,
        user_id=current_user.user_id,
        institution_id=institution_id,
        session_type=data.session_type,
        exam_type=data.exam_type,
        exam_part=data.exam_part,
        topic_id=data.topic_id,
        items_target=data.items_target,
        device_type=data.device_type,
        topic_ids=data.topic_ids,
        limit_type=data.limit_type,
        time_limit_minutes=data.time_limit_minutes,
        self_rated_level=data.self_rated_level,
    )
    return _session_out(session)


# ---------------------------------------------------------------------------
# GET /sessions/{id} — state
# ---------------------------------------------------------------------------


@router.get("/{session_id}", response_model=SessionOut)
async def get_session(
    session_id: uuid.UUID,
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> SessionOut:
    _require_institution(current_user)
    session = await practice_service._load_session(db, session_id, current_user.user_id)
    return _session_out(session)


# ---------------------------------------------------------------------------
# GET /sessions/{id}/next — adaptively-selected question
# ---------------------------------------------------------------------------


@router.get(
    "/{session_id}/next",
    response_model=None,
    responses={
        200: {
            "model": NextItemOut,
            "description": "Next question, or a NoMoreItems payload when the pool is exhausted.",
        }
    },
)
async def get_next(
    session_id: uuid.UUID,
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> NextItemOut | NoMoreItems:
    _require_institution(current_user)
    session, item, selection_theta, info = await practice_service.get_next_item(
        db, session_id, current_user.user_id
    )
    if item is None:
        return NoMoreItems(session_id=session.id, items_delivered=session.items_delivered)

    version = item.current_version
    options = sorted(version.options, key=lambda o: o.display_order)
    primary_topic = practice_service._primary_topic_id(item)
    return NextItemOut(
        session_id=session.id,
        item_id=item.id,
        item_version_id=version.id,
        content=version.content,
        image_url=practice_service.first_image_url(version),
        options=[NextOptionOut.model_validate(o) for o in options],
        primary_topic_id=primary_topic,
        # total_in_group is None in adaptive mode (one question served at a time);
        # the full passage still rides along so the question renders standalone.
        stimulus=_stimulus_out(item),
        selection_theta=selection_theta,
        item_irt_a=float(item.irt_a) if item.irt_a is not None else 1.0,
        item_irt_b=float(item.irt_b) if item.irt_b is not None else 0.0,
        fisher_information=info,
        items_delivered=session.items_delivered,
        items_target=session.items_target,
    )


# ---------------------------------------------------------------------------
# GET /sessions/{id}/exam-paper — the whole fixed question set, up front
# ---------------------------------------------------------------------------


@router.get("/{session_id}/exam-paper", response_model=ExamPaperOut)
async def get_exam_paper(
    session_id: uuid.UUID,
    current_user: CurrentUserDep,
    count: int | None = None,
    db: AsyncSession = Depends(get_db),
) -> ExamPaperOut:
    """Return the whole paper (all in-scope questions). Pass ``count`` only to
    cap it for a shorter mock paper."""
    _require_institution(current_user)
    capped = None if count is None else max(1, min(count, 500))
    items = await practice_service.exam_paper(
        db, session_id, current_user.user_id, capped
    )
    # How many questions on this paper share each passage — lets the client show
    # "passage 1 of 3" and render the passage once above its contiguous group.
    group_counts = Counter(i.stimulus_id for i in items if i.stimulus_id is not None)
    paper: list[ExamItemOut] = []
    for item in items:
        version = item.current_version
        if version is None:
            continue
        options = sorted(version.options, key=lambda o: o.display_order)
        paper.append(
            ExamItemOut(
                item_id=item.id,
                item_version_id=version.id,
                content=version.content,
                image_url=practice_service.first_image_url(version),
                options=[NextOptionOut.model_validate(o) for o in options],
                primary_topic_id=practice_service._primary_topic_id(item),
                stimulus=_stimulus_out(item, group_counts.get(item.stimulus_id)),
            )
        )
    return ExamPaperOut(session_id=session_id, items=paper, count=len(paper))


# ---------------------------------------------------------------------------
# POST /sessions/{id}/answer — grade + IRT/FSRS cascade
# ---------------------------------------------------------------------------


def _answer_result_out(result: dict) -> AnswerResultOut:
    """Map a service grade-result dict onto the API response model."""
    card_row = result["card_row"]
    schedule = result["card"]
    if card_row is not None and schedule is not None:
        card = CardScheduleOut(
            rating=schedule.rating,
            state=card_row.state,
            stability=float(card_row.stability),
            difficulty=float(card_row.difficulty),
            due_at=card_row.due_at,
            scheduled_interval_days=schedule.scheduled_interval_days,
            reps=card_row.reps,
            lapses=card_row.lapses,
        )
    else:
        # Skipped answer — no scheduling occurred.
        card = CardScheduleOut(
            rating=0,
            state="new",
            stability=0.0,
            difficulty=5.0,
            due_at=None,
            scheduled_interval_days=0.0,
            reps=0,
            lapses=0,
        )

    return AnswerResultOut(
        response_id=result["response_id"],
        item_id=result["item_id"],
        is_correct=result["is_correct"],
        was_skipped=result["was_skipped"],
        correct_option_id=result["correct_option_id"],
        explanation=result["explanation"],
        theta_before=result["theta_before"],
        theta_after=result["theta_after"],
        theta_se_after=result["theta_se_after"],
        topic_theta_after=result["topic_theta_after"],
        card=card,
        items_delivered=result["items_delivered"],
        items_correct=result["items_correct"],
    )


@router.post("/{session_id}/answer", response_model=AnswerResultOut)
async def submit_answer(
    session_id: uuid.UUID,
    data: AnswerSubmitRequest,
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> AnswerResultOut:
    _require_institution(current_user)
    result = await practice_service.submit_answer(
        db,
        session_id,
        current_user.user_id,
        item_id=data.item_id,
        selected_option_id=data.selected_option_id,
        response_time_ms=data.response_time_ms,
        was_skipped=data.was_skipped,
        is_timed_out=data.is_timed_out,
    )
    return _answer_result_out(result)


@router.post("/{session_id}/bulk-answers", response_model=BulkAnswerResultOut)
async def submit_answers_bulk(
    session_id: uuid.UUID,
    data: BulkAnswerSubmitRequest,
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> BulkAnswerResultOut:
    """Grade a batch of answers atomically (one transaction). Used by exam-format
    sessions that defer grading to submit time, instead of N sequential round-trips."""
    _require_institution(current_user)
    results = await practice_service.submit_answers_bulk(
        db,
        session_id,
        current_user.user_id,
        answers=data.answers,
    )
    return BulkAnswerResultOut(results=[_answer_result_out(r) for r in results])


# ---------------------------------------------------------------------------
# POST /sessions/{id}/finish — close + summary
# ---------------------------------------------------------------------------


@router.post("/{session_id}/finish", response_model=SessionSummaryOut)
async def finish_session(
    session_id: uuid.UUID,
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> SessionSummaryOut:
    _require_institution(current_user)
    session = await practice_service.finish_session(db, session_id, current_user.user_id)
    theta_start = float(session.theta_start) if session.theta_start is not None else None
    theta_end = float(session.theta_end) if session.theta_end is not None else None
    theta_delta = (
        theta_end - theta_start if theta_start is not None and theta_end is not None else None
    )
    items_wrong = max(
        session.items_delivered - session.items_correct - session.items_skipped, 0
    )
    return SessionSummaryOut(
        id=session.id,
        status=session.status,
        items_delivered=session.items_delivered,
        items_correct=session.items_correct,
        items_skipped=session.items_skipped,
        items_wrong=items_wrong,
        score_percent=float(session.score_percent) if session.score_percent is not None else None,
        net_score=float(session.net_score) if session.net_score is not None else None,
        penalty_per_wrong=(
            float(session.penalty_per_wrong) if session.penalty_per_wrong is not None else None
        ),
        theta_start=theta_start,
        theta_end=theta_end,
        theta_delta=theta_delta,
        started_at=session.started_at,
        completed_at=session.completed_at,
        time_spent_seconds=session.time_spent_seconds,
    )

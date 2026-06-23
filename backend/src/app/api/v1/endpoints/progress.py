"""Student progress endpoint — ability, per-topic mastery, recent sessions."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, get_db
from app.core.exceptions import ForbiddenError
from app.models.practice_session import PracticeSession
from app.models.response import Response
from app.models.topic import Topic
from app.models.user_theta import UserTheta
from app.models.user_topic_mastery import UserTopicMastery
from app.schemas.progress import (
    AbilityOut,
    ActivityPointOut,
    CategoryCardOut,
    ProgressOut,
    SessionBriefOut,
    StudentDashboardOut,
    StudyOverviewOut,
    SubjectRefOut,
    ThetaPointOut,
    TopicMasteryOut,
)
from app.services import practice_service

router = APIRouter(prefix="/me", tags=["Progress"])

CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


@router.get("/progress", response_model=ProgressOut)
async def get_progress(
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> ProgressOut:
    """The current user's learning progress across all sessions."""
    uid = current_user.user_id

    # Global ability (topic_id IS NULL)
    gt = (
        await db.execute(
            select(UserTheta).where(
                UserTheta.user_id == uid, UserTheta.topic_id.is_(None)
            )
        )
    ).scalar_one_or_none()

    # Overall answered / correct (graded, non-skipped responses)
    total = (
        await db.execute(
            select(func.count())
            .select_from(Response)
            .where(Response.user_id == uid, Response.is_correct.is_not(None))
        )
    ).scalar_one()
    correct = (
        await db.execute(
            select(func.count())
            .select_from(Response)
            .where(Response.user_id == uid, Response.is_correct.is_(True))
        )
    ).scalar_one()

    # Per-topic mastery, with topic names
    rows = (
        await db.execute(
            select(UserTopicMastery, Topic.name)
            .join(Topic, Topic.id == UserTopicMastery.topic_id)
            .where(UserTopicMastery.user_id == uid)
            .order_by(UserTopicMastery.total_responses.desc())
        )
    ).all()
    topics = [
        TopicMasteryOut(
            topic_id=m.topic_id,
            topic_name=name,
            mastery_level=m.mastery_level,
            theta=float(m.theta) if m.theta is not None else None,
            total_responses=m.total_responses,
            correct_responses=m.correct_responses,
            accuracy_rate=float(m.accuracy_rate) if m.accuracy_rate is not None else None,
        )
        for (m, name) in rows
    ]

    # Recent sessions
    sessions = (
        await db.execute(
            select(PracticeSession)
            .where(PracticeSession.user_id == uid)
            .order_by(PracticeSession.started_at.desc())
            .limit(10)
        )
    ).scalars().all()
    recent = [
        SessionBriefOut(
            id=s.id,
            session_type=s.session_type,
            status=s.status,
            items_delivered=s.items_delivered,
            items_correct=s.items_correct,
            score_percent=float(s.score_percent) if s.score_percent is not None else None,
            net_score=float(s.net_score) if s.net_score is not None else None,
            started_at=s.started_at,
            completed_at=s.completed_at,
        )
        for s in sessions
    ]

    return ProgressOut(
        global_theta=float(gt.theta) if gt is not None else None,
        global_theta_se=float(gt.theta_se) if gt is not None else None,
        total_responses=total,
        total_correct=correct,
        accuracy=(correct / total if total else None),
        topics=topics,
        recent_sessions=recent,
    )


@router.get("/categories", response_model=StudyOverviewOut)
async def get_study_overview(
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> StudyOverviewOut:
    """Per-category study-journey cards (new / due / mastery) for the student."""
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required to browse categories.")
    cards = await practice_service.study_overview(
        db, current_user.user_id, current_user.institution_id
    )
    return StudyOverviewOut(categories=[CategoryCardOut(**c) for c in cards])


@router.get("/dashboard", response_model=StudentDashboardOut)
async def get_student_dashboard(
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(get_db),
) -> StudentDashboardOut:
    """The student's home dashboard — one rich snapshot of their whole state."""
    if current_user.institution_id is None:
        raise ForbiddenError("Institution context required for the dashboard.")
    d = await practice_service.student_dashboard(
        db, current_user.user_id, current_user.institution_id
    )
    return StudentDashboardOut(
        ability=AbilityOut(theta=d["theta"], theta_se=d["theta_se"], level=d["level"]),
        answered=d["answered"],
        correct=d["correct"],
        accuracy=d["accuracy"],
        sessions=d["sessions"],
        library_total=d["library_total"],
        library_seen=d["library_seen"],
        library_new=d["library_new"],
        due_now=d["due_now"],
        cards_learning=d["cards_learning"],
        cards_review=d["cards_review"],
        topics_active=d["topics_active"],
        topics_mastered=d["topics_mastered"],
        mastery=d["mastery"],
        streak_days=d["streak_days"],
        activity=[ActivityPointOut(**a) for a in d["activity"]],
        theta_trend=[ThetaPointOut(**p) for p in d["theta_trend"]],
        strongest=SubjectRefOut(**d["strongest"]) if d["strongest"] else None,
        focus=SubjectRefOut(**d["focus"]) if d["focus"] else None,
        recent_sessions=[
            SessionBriefOut(
                id=s.id,
                session_type=s.session_type,
                status=s.status,
                items_delivered=s.items_delivered,
                items_correct=s.items_correct,
                score_percent=float(s.score_percent) if s.score_percent is not None else None,
                net_score=float(s.net_score) if s.net_score is not None else None,
                started_at=s.started_at,
                completed_at=s.completed_at,
            )
            for s in d["recent_sessions"]
        ],
    )

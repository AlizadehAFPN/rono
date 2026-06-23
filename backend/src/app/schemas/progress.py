"""Schemas for the student progress endpoint."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class TopicMasteryOut(BaseModel):
    topic_id: uuid.UUID
    topic_name: str
    mastery_level: str
    theta: float | None
    total_responses: int
    correct_responses: int
    accuracy_rate: float | None


class SessionBriefOut(BaseModel):
    id: uuid.UUID
    session_type: str
    status: str
    items_delivered: int
    items_correct: int
    score_percent: float | None
    net_score: float | None
    started_at: datetime
    completed_at: datetime | None


class ProgressOut(BaseModel):
    global_theta: float | None
    global_theta_se: float | None
    total_responses: int
    total_correct: int
    accuracy: float | None
    topics: list[TopicMasteryOut]
    recent_sessions: list[SessionBriefOut]


class CategoryCardOut(BaseModel):
    """One category (topic) as a study-journey card for the current student."""

    topic_id: uuid.UUID
    topic_name: str
    level: int
    exam_type: str | None
    total_questions: int
    answered: int
    new_count: int
    due_count: int
    mastery_level: str
    topic_theta: float | None
    accuracy_rate: float | None
    # Journey stage: not_started | learning | reviewing | mastered
    journey_state: str
    # Suggested session_type for the primary action: adaptive_practice | review | None
    recommended_mode: str | None


class StudyOverviewOut(BaseModel):
    categories: list[CategoryCardOut]


# ---------------------------------------------------------------------------
# Student home dashboard
# ---------------------------------------------------------------------------


class AbilityOut(BaseModel):
    theta: float | None
    theta_se: float | None
    # Friendly band: beginner | developing | proficient | advanced
    level: str


class ActivityPointOut(BaseModel):
    date: str  # YYYY-MM-DD (UTC)
    count: int


class ThetaPointOut(BaseModel):
    at: datetime
    theta: float


class SubjectRefOut(BaseModel):
    topic_id: uuid.UUID
    topic_name: str
    accuracy_rate: float | None


class StudentDashboardOut(BaseModel):
    ability: AbilityOut
    answered: int
    correct: int
    accuracy: float | None
    sessions: int
    # Question-bank coverage for this student.
    library_total: int
    library_seen: int
    library_new: int
    # Spaced-repetition workload right now.
    due_now: int
    cards_learning: int
    cards_review: int
    # Mastery rollup across subjects the student has touched.
    topics_active: int
    topics_mastered: int
    mastery: dict[str, int]
    # Engagement.
    streak_days: int
    activity: list[ActivityPointOut]
    theta_trend: list[ThetaPointOut]
    strongest: SubjectRefOut | None
    focus: SubjectRefOut | None
    recent_sessions: list[SessionBriefOut]

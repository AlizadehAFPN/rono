"""Schemas for analytics & reporting."""

import uuid

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_items: int
    active_items: int
    total_responses: int
    overall_accuracy: float | None
    total_users: int
    completed_sessions: int


class ItemStat(BaseModel):
    item_id: uuid.UUID
    preview: str
    exam_type: str | None
    exam_part: str | None
    irt_b: float | None
    calibration_status: str
    response_count: int
    accuracy: float | None


class ItemStatsResponse(BaseModel):
    items: list[ItemStat]

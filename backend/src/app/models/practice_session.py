import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False, index=True
    )
    assignment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=True
    )
    curriculum_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("curricula.id"), nullable=True
    )
    session_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="adaptive_practice"
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="in_progress")
    items_target: Mapped[int | None] = mapped_column(Integer, nullable=True)
    items_delivered: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    items_correct: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    items_skipped: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    score_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    # Penalty-adjusted exam score: correct - wrong * penalty_per_wrong (blanks excluded).
    # Purely a reporting figure — never feeds IRT theta or FSRS scheduling.
    net_score: Mapped[float | None] = mapped_column(Numeric(7, 3), nullable=True)
    penalty_per_wrong: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    theta_start: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    theta_end: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_spent_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    client_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    assignment: Mapped["Assignment | None"] = relationship(
        "Assignment", back_populates="practice_sessions"
    )
    responses: Mapped[list["Response"]] = relationship("Response", back_populates="session")

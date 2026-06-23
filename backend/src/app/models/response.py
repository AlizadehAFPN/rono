import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Index, Integer, Numeric, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Response(Base):
    __tablename__ = "responses"
    __table_args__ = (
        # Hot path: IRT theta recompute over a user's graded history, on every
        # answer submit. Partial keeps it small by excluding skipped/ungraded.
        Index(
            "ix_responses_user_graded",
            "user_id",
            "item_id",
            postgresql_where=text("was_skipped = false AND is_correct IS NOT NULL"),
        ),
        # Dashboard activity heatmap (WHERE user_id = ? AND created_at >= ?).
        Index("ix_responses_user_created_at", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False, index=True
    )
    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("items.id"), nullable=False, index=True
    )
    item_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("item_versions.id"), nullable=True
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practice_sessions.id"), nullable=True, index=True
    )
    primary_topic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True
    )
    selected_option_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("options.id"), nullable=True
    )
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    response_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    theta_at_response: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    theta_domain_at_response: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    fsrs_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_timed_out: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_flagged_by_student: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    was_skipped: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    scoring_context: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), index=True
    )

    session: Mapped["PracticeSession | None"] = relationship(
        "PracticeSession", back_populates="responses"
    )

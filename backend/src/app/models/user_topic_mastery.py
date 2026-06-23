import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, PrimaryKeyConstraint, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserTopicMastery(Base):
    __tablename__ = "user_topic_mastery"
    __table_args__ = (PrimaryKeyConstraint("user_id", "topic_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False
    )
    theta: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    mastery_level: Mapped[str] = mapped_column(String(20), nullable=False, default="not_started")
    total_responses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    correct_responses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    accuracy_rate: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    avg_response_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    retention_rate: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    items_due_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    first_response_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_response_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

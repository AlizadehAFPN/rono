import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ThetaHistory(Base):
    __tablename__ = "theta_history"
    __table_args__ = (
        # Ability trend chart (WHERE user_id = ? AND topic_id IS NULL
        # ORDER BY created_at DESC).
        Index("ix_theta_history_user_topic_created", "user_id", "topic_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False
    )
    topic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True
    )
    theta: Mapped[float] = mapped_column(Numeric(8, 4), nullable=False)
    theta_se: Mapped[float] = mapped_column(Numeric(8, 4), nullable=False)
    responses_used: Mapped[int] = mapped_column(Integer, nullable=False)
    trigger_response_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("responses.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), index=True
    )

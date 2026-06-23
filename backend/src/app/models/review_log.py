import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Numeric, SmallInteger, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ReviewLog(Base):
    __tablename__ = "review_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("items.id"), nullable=False, index=True
    )
    response_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("responses.id"), nullable=True
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practice_sessions.id"), nullable=True
    )
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    state_before: Mapped[str] = mapped_column(String(20), nullable=False)
    difficulty_before: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    stability_before: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    state_after: Mapped[str] = mapped_column(String(20), nullable=False)
    difficulty_after: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    stability_after: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    scheduled_interval_days: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    elapsed_days: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), index=True
    )

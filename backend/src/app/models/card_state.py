import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, PrimaryKeyConstraint, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CardState(Base):
    __tablename__ = "card_states"
    __table_args__ = (
        PrimaryKeyConstraint("user_id", "item_id"),
        # Hot path: due-card scheduling (WHERE user_id = ? AND due_at <= now).
        Index("ix_card_states_user_due", "user_id", "due_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("items.id", ondelete="CASCADE"), nullable=False
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False
    )
    state: Mapped[str] = mapped_column(String(20), nullable=False, default="new")
    difficulty: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False, default=5.0)
    stability: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False, default=0.0)
    due_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    last_review_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lapses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reps: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    retrievability: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

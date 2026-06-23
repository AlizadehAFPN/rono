import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserTheta(Base):
    __tablename__ = "user_thetas"
    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="uq_user_theta_user_topic"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False
    )
    topic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True
    )
    theta: Mapped[float] = mapped_column(Numeric(8, 4), nullable=False, default=0.0)
    theta_se: Mapped[float] = mapped_column(Numeric(8, 4), nullable=False, default=1.0)
    responses_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    prior_weight: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False, default=1.0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

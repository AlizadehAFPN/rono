import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ItemAnalytics(Base):
    __tablename__ = "item_analytics"
    __table_args__ = (PrimaryKeyConstraint("item_id", "institution_id"),)

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("items.id", ondelete="CASCADE"), nullable=False
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    total_responses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    correct_responses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_response_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # IRT parameters estimated from calibration
    difficulty_irt: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    discrimination_irt: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    # Point-biserial correlation: how well this item discriminates
    point_biserial: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    # Facility index: proportion of students who answered correctly
    facility_index: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    # Flag counts
    flag_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skip_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    timeout_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_calibrated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

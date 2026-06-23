import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CohortSnapshot(Base):
    __tablename__ = "cohort_snapshots"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Cohort can be scoped to a curriculum or assignment; NULL = institution-wide
    curriculum_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("curricula.id", ondelete="SET NULL"), nullable=True
    )
    assignment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="SET NULL"), nullable=True
    )
    snapshot_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    # Aggregate stats over the cohort at snapshot time
    student_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_theta: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    median_theta: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    stddev_theta: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    avg_accuracy_rate: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    avg_retention_rate: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    total_responses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Mastery distribution: {"not_started": N, "learning": N, "proficient": N, "mastered": N}
    mastery_distribution: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # Topic-level breakdown stored as JSONB for flexibility
    topic_breakdown: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )

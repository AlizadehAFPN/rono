import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Item(Base):
    __tablename__ = "items"
    __table_args__ = (
        # Hot path: candidate-item selection (WHERE institution_id = ?
        # AND status = ? AND deleted_at IS NULL), run on every question served.
        Index(
            "ix_items_institution_status_active",
            "institution_id",
            "status",
            postgresql_where=text("deleted_at IS NULL"),
        ),
        # Fetch all questions of a shared passage in order (exam-paper grouping).
        Index("ix_items_stimulus_order", "stimulus_id", "stimulus_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    current_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("item_versions.id", use_alter=True, name="fk_items_current_version_id"),
        nullable=True,
    )
    # Optional shared reading passage / scenario this question belongs to.
    # Nullable: most questions are standalone. ON DELETE SET NULL so removing a
    # passage degrades its questions to standalone, never deletes them.
    stimulus_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stimuli.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # 1-based position of this question within its passage's run of questions.
    stimulus_order: Mapped[int | None] = mapped_column(Integer, nullable=True)
    item_type: Mapped[str] = mapped_column(String(30), nullable=False, default="single_best_answer")
    # Employment exam: executive | education | bank | social_security (see core/exams.py).
    exam_type: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    # Exam-based section, distinct from the (topic-based) topic tree:
    # "general" (دروس عمومی) | "specialized" (دروس تخصصی).
    exam_part: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    # Content language (ISO 639-1). Persian by default.
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="fa", index=True)
    # Provenance of the question (e.g. official past papers).
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g. "sanjesh"
    source_reference: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # e.g. "آزمون استخدامی آموزش و پرورش ۱۴۰۱"
    exam_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    exam_session: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # e.g. "spring" | "fall"
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", index=True)
    calibration_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="uncalibrated"
    )
    irt_a: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    irt_b: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    irt_a_se: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    irt_b_se: Mapped[float | None] = mapped_column(Numeric(8, 4), nullable=True)
    irt_responses_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    irt_last_calibrated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    avg_response_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    times_seen: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    versions: Mapped[list["ItemVersion"]] = relationship(
        "ItemVersion", back_populates="item", foreign_keys="ItemVersion.item_id"
    )
    current_version: Mapped["ItemVersion | None"] = relationship(
        "ItemVersion", foreign_keys=[current_version_id]
    )
    stimulus: Mapped["Stimulus | None"] = relationship("Stimulus", back_populates="items")
    item_topic_links: Mapped[list["ItemTopicLink"]] = relationship(
        "ItemTopicLink", back_populates="item"
    )
    tags: Mapped[list["ItemTag"]] = relationship("ItemTag", back_populates="item")
    flags: Mapped[list["ItemFlag"]] = relationship("ItemFlag", back_populates="item")

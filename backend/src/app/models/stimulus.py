import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Stimulus(Base):
    """A shared reading passage / scenario referenced by one or more items.

    One Stimulus → many Items (e.g. one comprehension passage feeds questions
    1, 2, 3). The passage body lives here once; each linked Item carries its
    position within the passage's run via ``Item.stimulus_order``. The stimulus
    is purely presentational shared content — correctness is never involved —
    and it travels with every question of the group so the learner can re-read
    it while answering each one.
    """

    __tablename__ = "stimuli"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Optional shared media (e.g. [{"url": "...", "alt": "..."}]) — same shape as
    # ItemVersion.media_attachments, so first_image_url_media() works on both.
    media_attachments: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    # Content language (ISO 639-1); mirrors Item.language. Persian by default.
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="fa")
    # Provenance — which exam/source booklet this passage came from.
    source_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # The passage's own number within its source booklet (e.g. "passage 2").
    group_no: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    items: Mapped[list["Item"]] = relationship("Item", back_populates="stimulus")

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    preferred_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    locale: Mapped[str] = mapped_column(String(10), nullable=False, default="en")
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="UTC")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    mfa_secret_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Daily-review target — a persistent, editable preference (profile + the daily
    # setup form both write these). Each daily session is seeded from them; the
    # learner can change them any time. Sensible defaults mirror the old hardcoded
    # session form so existing users keep their previous experience.
    daily_target_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=20, server_default="20"
    )
    daily_limit_type: Mapped[str] = mapped_column(
        String(10), nullable=False, default="count", server_default="count"
    )
    daily_time_limit_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=20, server_default="20"
    )
    # How many brand-new cards the learner may be introduced to per day. Higher
    # values let large daily targets fill with new material (at the cost of a
    # heavier future review load — pure FSRS workload management, not scheduling).
    daily_new_cards_cap: Mapped[int] = mapped_column(
        Integer, nullable=False, default=20, server_default="20"
    )
    # Chosen collections (topic id strings) for the daily session; NULL = all.
    daily_topic_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    # Cold-start self-assessment carried over from the setup form (nullable).
    daily_self_rated_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
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

    memberships: Mapped[list["Membership"]] = relationship(
        "Membership", foreign_keys="[Membership.user_id]", back_populates="user"
    )
    auth_sessions: Mapped[list["AuthSession"]] = relationship("AuthSession", back_populates="user")
    password_reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        "PasswordResetToken", back_populates="user"
    )

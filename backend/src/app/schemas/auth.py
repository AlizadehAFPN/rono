import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_PASSWORD_MIN_LEN = 8
_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_TIMEZONE_RE = re.compile(r"^[A-Za-z0-9+\-_/]{1,50}$")
_SUPPORTED_LOCALES = {"en", "tr"}


def _validate_password_strength(v: str) -> str:
    """Shared password policy: 8+ chars, upper, lower, digit."""
    if len(v) < _PASSWORD_MIN_LEN:
        raise ValueError(f"Password must be at least {_PASSWORD_MIN_LEN} characters.")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit.")
    return v


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    institution_name: str
    institution_slug: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password_strength(v)

    @field_validator("institution_slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        v = v.lower().strip()
        if not _SLUG_RE.match(v):
            raise ValueError(
                "Slug must be lowercase alphanumeric words separated by hyphens "
                "(e.g. 'my-school-2024')."
            )
        if not (3 <= len(v) <= 100):
            raise ValueError("Slug must be between 3 and 100 characters.")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty.")
        return v

    @field_validator("institution_name")
    @classmethod
    def validate_institution_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Institution name cannot be empty.")
        return v


class SignupRequest(BaseModel):
    """Open student self-registration.

    Deliberately minimal — only "email looks like an email, password non-empty,
    name non-empty". Password strength rules and email confirmation are added
    later; do not tighten this without updating the frontend signup form.
    """

    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v:
            raise ValueError("Password cannot be empty.")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None
    preferred_name: str | None
    avatar_url: str | None
    locale: str
    timezone: str
    is_active: bool
    email_verified_at: datetime | None
    mfa_enabled: bool
    last_login_at: datetime | None
    created_at: datetime
    # Persistent Daily Review target (editable from profile + the daily form).
    daily_target_count: int
    daily_limit_type: str
    daily_time_limit_minutes: int
    daily_new_cards_cap: int
    daily_topic_ids: list[str] | None
    daily_self_rated_level: str | None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Self-service profile + account management
# ---------------------------------------------------------------------------


class ProfileUpdateRequest(BaseModel):
    """Self-service profile edit. Every field is optional — only provided keys
    are applied (PATCH semantics). ``None`` clears a nullable field; an absent
    key leaves it untouched (use ``model_fields_set`` in the service)."""

    full_name: str | None = None
    preferred_name: str | None = None
    avatar_url: str | None = None
    locale: str | None = None
    timezone: str | None = None
    # Daily Review target — same fields the daily setup form writes. All optional
    # (PATCH semantics); only provided keys are applied.
    daily_target_count: int | None = Field(default=None, ge=1, le=500)
    daily_limit_type: Literal["count", "time"] | None = None
    daily_time_limit_minutes: int | None = Field(default=None, ge=1, le=240)
    daily_new_cards_cap: int | None = Field(default=None, ge=0, le=200)
    # None ⇒ all collections. A list of topic-id strings restricts the session.
    # Stored as plain strings in a JSONB column; each must be a valid UUID.
    daily_topic_ids: list[str] | None = None
    daily_self_rated_level: (
        Literal["beginner", "developing", "proficient", "advanced"] | None
    ) = None

    @field_validator("daily_topic_ids")
    @classmethod
    def validate_topic_ids(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None
        # Normalise to canonical UUID strings, rejecting anything malformed.
        return [str(uuid.UUID(str(x))) for x in v]

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty.")
        if len(v) > 255:
            raise ValueError("Full name is too long.")
        return v

    @field_validator("preferred_name")
    @classmethod
    def validate_preferred_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        # Empty string clears the preferred name back to None.
        if not v:
            return None
        if len(v) > 255:
            raise ValueError("Preferred name is too long.")
        return v

    @field_validator("locale")
    @classmethod
    def validate_locale(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip().lower()
        if v not in _SUPPORTED_LOCALES:
            allowed = ", ".join(sorted(_SUPPORTED_LOCALES))
            raise ValueError(f"Unsupported locale. Choose one of: {allowed}.")
        return v

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not _TIMEZONE_RE.match(v):
            raise ValueError("Invalid timezone identifier.")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return _validate_password_strength(v)


class SessionOut(BaseModel):
    """One active login session — powers the transparent 'where you're signed in' view."""

    id: uuid.UUID
    ip_address: str | None
    user_agent: str | None
    created_at: datetime
    expires_at: datetime
    is_current: bool

    model_config = ConfigDict(from_attributes=True)


class MembershipOut(BaseModel):
    institution_id: uuid.UUID
    role: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    user: UserOut
    memberships: list[MembershipOut]

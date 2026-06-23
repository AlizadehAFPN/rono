import uuid
from datetime import UTC, datetime, timedelta
from typing import Literal

import bcrypt as _bcrypt
from fastapi import Response
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings

# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------


def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


# ---------------------------------------------------------------------------
# JWT token payload
# ---------------------------------------------------------------------------


class TokenPayload(BaseModel):
    sub: str  # user_id as str(uuid)
    jti: str  # session_id as str(uuid) → maps to auth_sessions.id
    institution_id: str | None = None
    role: str = "student"
    type: Literal["access", "refresh"]
    exp: int  # unix timestamp
    iat: int


# ---------------------------------------------------------------------------
# Token creation
# ---------------------------------------------------------------------------


def _build_token(
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    institution_id: uuid.UUID | None,
    role: str,
    token_type: Literal["access", "refresh"],
    expires_delta: timedelta,
) -> str:
    now = datetime.now(UTC)
    payload: dict = {
        "sub": str(user_id),
        "jti": str(session_id),
        "institution_id": str(institution_id) if institution_id else None,
        "role": role,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    institution_id: uuid.UUID | None,
    role: str,
) -> str:
    return _build_token(
        user_id,
        session_id,
        institution_id,
        role,
        "access",
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    institution_id: uuid.UUID | None,
    role: str,
) -> str:
    return _build_token(
        user_id,
        session_id,
        institution_id,
        role,
        "refresh",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


# ---------------------------------------------------------------------------
# Token decoding
# ---------------------------------------------------------------------------


def decode_token(token: str) -> TokenPayload:
    # Import here to avoid circular: security → exceptions (exceptions has no imports from security)
    from app.core.exceptions import InvalidTokenError

    try:
        raw = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return TokenPayload(**raw)
    except (JWTError, Exception) as exc:
        raise InvalidTokenError("Token is invalid or expired.") from exc


# ---------------------------------------------------------------------------
# Cookie helpers
# ---------------------------------------------------------------------------


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = settings.cookie_secure
    # Access token sent on every API request.
    #
    # The cookie is the transport; the JWT's own `exp` (15 min) is the real
    # expiry the backend enforces. We deliberately let the COOKIE outlive the
    # token (matching the refresh token's lifetime) so the browser keeps the
    # cookie around for the whole session. If the cookie expired at 15 min, the
    # browser would drop it and a full-page navigation to /dashboard would hit
    # the Next middleware (proxy.ts) with no access_token cookie and bounce the
    # user to /login — even though the refresh token is still valid. Keeping the
    # cookie alive lets that navigation through; the stale JWT then 401s on the
    # first API call and the client silently refreshes it.
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/",
    )
    # Refresh token scoped only to the auth endpoints — never leaks to other routes
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/v1/auth",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")

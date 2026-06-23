"""
Authentication endpoints.

Security design:
  - Access token (15 min) + refresh token (7 days) both in httpOnly cookies.
  - Refresh token cookie is scoped to /api/v1/auth so it is never sent
    on content/items/topics requests — minimises exposure window.
  - Token rotation: every /refresh call revokes the old session and creates a new one.
  - /logout revokes the DB session — renders existing JWTs inoperative even before expiry.
  - Passwords are validated for strength before hashing (8+ chars, upper, lower, digit).
  - Login error messages are deliberately generic — never reveal whether an email exists.
"""

import uuid

from fastapi import APIRouter, Depends, File, Request, Response, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, get_db
from app.core.exceptions import UnauthorizedError
from app.core.security import (
    clear_auth_cookies,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
)
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MembershipOut,
    MeResponse,
    ProfileUpdateRequest,
    RegisterRequest,
    SessionOut,
    SignupRequest,
    UserOut,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _client_info(request: Request) -> tuple[str | None, str | None]:
    """Extract IP (honouring X-Forwarded-For) and User-Agent from the request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")
    return ip, user_agent


def _build_me_response(user, memberships) -> MeResponse:
    return MeResponse(
        user=UserOut.model_validate(user),
        memberships=[MembershipOut.model_validate(m) for m in memberships],
    )


def _session_ended_response(detail: str) -> JSONResponse:
    """401 response that also clears the auth cookies.

    Used when a refresh is rejected (no/expired/revoked refresh token): the
    session is genuinely over, so we must wipe the long-lived access_token
    cookie too. Otherwise its mere presence keeps the Next middleware
    (proxy.ts) treating the user as logged-in, bouncing them /login ⇄
    /dashboard in a loop. Built as a returned Response (not a raised
    exception) because the exception handler would discard the Set-Cookie
    headers.
    """
    response = JSONResponse(status_code=401, content={"detail": detail})
    clear_auth_cookies(response)
    return response


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------


@router.post("/register", response_model=MeResponse, status_code=201)
async def register(
    data: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """
    Create a new institution and its first administrator account.
    Sets httpOnly access + refresh token cookies on success.
    """
    ip, user_agent = _client_info(request)
    user, membership, auth_session = await auth_service.register(db, data, ip, user_agent)

    access_token = create_access_token(
        user_id=user.id,
        session_id=auth_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        session_id=auth_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    set_auth_cookies(response, access_token, refresh_token)

    return _build_me_response(user, [membership])


# ---------------------------------------------------------------------------
# POST /auth/signup — open student self-registration
# ---------------------------------------------------------------------------


@router.post("/signup", response_model=MeResponse, status_code=201)
async def signup(
    data: SignupRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """
    Open student self-registration: creates an active student account in the
    existing institution and logs them in. Sets the same httpOnly access +
    refresh token cookies as login.
    """
    ip, user_agent = _client_info(request)
    user, membership, auth_session = await auth_service.signup(db, data, ip, user_agent)

    access_token = create_access_token(
        user_id=user.id,
        session_id=auth_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        session_id=auth_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    set_auth_cookies(response, access_token, refresh_token)

    return _build_me_response(user, [membership])


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------


@router.post("/login", response_model=MeResponse)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """
    Authenticate with email + password.
    Sets httpOnly access + refresh token cookies on success.
    """
    ip, user_agent = _client_info(request)
    user, membership, auth_session = await auth_service.login(db, data, ip, user_agent)

    access_token = create_access_token(
        user_id=user.id,
        session_id=auth_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        session_id=auth_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    set_auth_cookies(response, access_token, refresh_token)

    return _build_me_response(user, [membership])


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------


@router.post("/logout", status_code=204)
async def logout(
    response: Response,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Revoke the current session in the database and clear cookies.
    The access token becomes inoperative immediately (DB session check).
    """
    await auth_service.logout(db, current_user.session_id)
    clear_auth_cookies(response)


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------


@router.post("/refresh", response_model=MeResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse | JSONResponse:
    """
    Exchange a valid refresh token for a new access + refresh token pair.
    Reads the refresh_token cookie (NOT the access_token cookie).
    The old session is revoked and a new one is created (token rotation).

    Note: get_current_user is deliberately NOT used here — the access token
    may be expired when this endpoint is called, which is the whole point.
    """
    refresh_token_str = request.cookies.get("refresh_token")
    if not refresh_token_str:
        return _session_ended_response("No refresh token found. Please log in again.")

    ip, user_agent = _client_info(request)
    try:
        user, membership, new_session = await auth_service.refresh(
            db, refresh_token_str, ip, user_agent
        )
    except UnauthorizedError as exc:
        # Refresh token is expired or revoked — the session is truly over.
        # Clear cookies so the browser stops presenting a dead session.
        return _session_ended_response(exc.detail)

    access_token = create_access_token(
        user_id=user.id,
        session_id=new_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    new_refresh_token = create_refresh_token(
        user_id=user.id,
        session_id=new_session.id,
        institution_id=membership.institution_id,
        role=membership.role,
    )
    set_auth_cookies(response, access_token, new_refresh_token)

    return _build_me_response(user, [membership])


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------


@router.get("/me", response_model=MeResponse)
async def me(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """Return the authenticated user's profile and all active memberships."""
    user, memberships = await auth_service.get_me(db, current_user.user_id)
    return _build_me_response(user, memberships)


# ---------------------------------------------------------------------------
# PATCH /auth/me — self-service profile update
# ---------------------------------------------------------------------------


@router.patch("/me", response_model=MeResponse)
async def update_me(
    data: ProfileUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """Update the authenticated user's own profile (name, locale, timezone, avatar)."""
    user, memberships = await auth_service.update_profile(db, current_user.user_id, data)
    return _build_me_response(user, memberships)


# ---------------------------------------------------------------------------
# PUT /auth/me/avatar — upload a profile photo
# ---------------------------------------------------------------------------


@router.put("/me/avatar", response_model=MeResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """Upload (or replace) the authenticated user's avatar.

    The image is validated server-side by its magic bytes and size; the previous
    avatar file, if we managed it, is deleted. Returns the refreshed profile so
    the client can update its cached user immediately.
    """
    contents = await file.read()
    user, memberships = await auth_service.set_avatar(db, current_user.user_id, contents)
    return _build_me_response(user, memberships)


@router.delete("/me/avatar", response_model=MeResponse)
async def delete_avatar(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    """Remove the authenticated user's avatar (falls back to initials)."""
    user, memberships = await auth_service.clear_avatar(db, current_user.user_id)
    return _build_me_response(user, memberships)


# ---------------------------------------------------------------------------
# POST /auth/change-password
# ---------------------------------------------------------------------------


@router.post("/change-password", status_code=204)
async def change_password(
    data: ChangePasswordRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Change the authenticated user's password. Verifies the current password
    and revokes all other active sessions (the current one is kept)."""
    await auth_service.change_password(
        db, current_user.user_id, current_user.session_id, data
    )


# ---------------------------------------------------------------------------
# Active sessions — transparent device view + remote sign-out
# ---------------------------------------------------------------------------


@router.get("/sessions", response_model=list[SessionOut])
async def list_sessions(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SessionOut]:
    """List the user's live login sessions, flagging the current one."""
    sessions = await auth_service.list_sessions(db, current_user.user_id)
    return [
        SessionOut(
            id=s.id,
            ip_address=s.ip_address,
            user_agent=s.user_agent,
            created_at=s.created_at,
            expires_at=s.expires_at,
            is_current=s.id == current_user.session_id,
        )
        for s in sessions
    ]


@router.delete("/sessions/others", status_code=204)
async def revoke_other_sessions(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Sign out of every session except the current one."""
    await auth_service.revoke_other_sessions(
        db, current_user.user_id, current_user.session_id
    )


@router.delete("/sessions/{session_id}", status_code=204)
async def revoke_session(
    session_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Revoke one of the user's own sessions (sign out a single device)."""
    await auth_service.revoke_session(db, current_user.user_id, session_id)

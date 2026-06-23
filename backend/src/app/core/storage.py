"""Local filesystem storage for user-uploaded media (currently avatars).

Files are written under ``settings.UPLOAD_DIR`` and served back as static assets
under ``/api/v1/uploads`` (see ``main.py``). Keeping the public prefix under
``/api`` means the Next.js frontend's ``/api/:path*`` rewrite proxies avatar
requests to the backend with no extra config — the browser just loads
``<img src="/api/v1/uploads/avatars/…">`` same-origin.

Images are validated by sniffing their magic bytes rather than trusting the
client-declared Content-Type, and filenames are random UUIDs so the public URL
is unguessable (avatars are served without auth so they render in plain <img>
tags even after the short-lived access token expires).
"""

import uuid
from pathlib import Path

from app.core.config import settings
from app.core.exceptions import BadRequestError, UnprocessableError

# Public URL prefix — MUST match the StaticFiles mount in main.py.
AVATAR_URL_PREFIX = "/api/v1/uploads/avatars"
AVATAR_SUBDIR = "avatars"

# Sniffed image type -> file extension. The set of formats we accept.
_IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def _sniff_image_type(data: bytes) -> str | None:
    """Identify an image format from its leading bytes, or None if unrecognised."""
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    return None


def _avatars_dir() -> Path:
    d = Path(settings.UPLOAD_DIR) / AVATAR_SUBDIR
    d.mkdir(parents=True, exist_ok=True)
    return d


def is_local_avatar(url: str | None) -> bool:
    """True if ``url`` points at a file we manage on disk (vs. an external URL)."""
    return bool(url) and url.startswith(AVATAR_URL_PREFIX + "/")


def save_avatar_file(data: bytes) -> str:
    """Validate raw image bytes, persist them, and return the public URL.

    Raises BadRequestError / UnprocessableError on empty, oversized, or
    unsupported input.
    """
    if not data:
        raise BadRequestError("Uploaded file is empty.")
    if len(data) > settings.MAX_AVATAR_BYTES:
        mb = settings.MAX_AVATAR_BYTES // (1024 * 1024)
        raise UnprocessableError(f"Image is too large. Maximum size is {mb} MB.")

    image_type = _sniff_image_type(data)
    if image_type is None:
        raise UnprocessableError(
            "Unsupported image format. Use JPEG, PNG, WebP, or GIF."
        )

    extension = _IMAGE_EXTENSIONS[image_type]
    filename = f"{uuid.uuid4().hex}{extension}"
    (_avatars_dir() / filename).write_bytes(data)
    return f"{AVATAR_URL_PREFIX}/{filename}"


def delete_avatar_file(url: str | None) -> None:
    """Remove the on-disk file backing a local avatar URL. No-op for external
    URLs or anything that looks like a path-traversal attempt."""
    if not is_local_avatar(url):
        return
    assert url is not None  # narrowed by is_local_avatar
    filename = url.rsplit("/", 1)[-1]
    if not filename or "/" in filename or "\\" in filename or ".." in filename:
        return
    try:
        (_avatars_dir() / filename).unlink(missing_ok=True)
    except OSError:
        # A leftover file is harmless; never fail the request over cleanup.
        pass

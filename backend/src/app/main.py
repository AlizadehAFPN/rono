from contextlib import asynccontextmanager
from pathlib import Path

import redis.asyncio as aioredis
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api import v1_router
from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import RonoException, rono_exception_handler

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("server.starting", environment=settings.ENVIRONMENT)
    yield
    logger.info("server.stopping")
    await engine.dispose()


app = FastAPI(
    title="Rono — Employment-Exam API",
    version="0.1.0",
    description=(
        "REST API for Rono — a review system for Iran's employment-exam "
        "(آزمون استخدامی) question bank."
    ),
    lifespan=lifespan,
    redirect_slashes=False,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

app.add_exception_handler(RonoException, rono_exception_handler)  # type: ignore[arg-type]

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(v1_router)

# ---------------------------------------------------------------------------
# Static media — user-uploaded avatars
#
# Mounted under /api/v1 so the frontend's /api/:path* rewrite proxies these
# requests to the backend without extra config. Served publicly (no auth) with
# unguessable UUID filenames so plain <img> tags keep working after the
# short-lived access token expires.
# ---------------------------------------------------------------------------

_uploads_dir = Path(settings.UPLOAD_DIR)
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount(
    "/api/v1/uploads",
    StaticFiles(directory=str(_uploads_dir)),
    name="uploads",
)


# ---------------------------------------------------------------------------
# Infrastructure probes (not part of the versioned API)
# ---------------------------------------------------------------------------


@app.get("/api/v1/health", tags=["Infrastructure"])
async def health_check() -> dict:
    """Liveness probe — returns 200 if the process is running."""
    return {"status": "ok"}


@app.get("/api/v1/ready", tags=["Infrastructure"])
async def readiness_check() -> dict:
    """
    Readiness probe — checks Postgres and Redis connectivity.
    Returns 200 with status=ok if all dependencies are reachable,
    or 200 with status=degraded (and per-check details) if any fail.
    """
    checks: dict[str, str] = {}

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["postgres"] = "ok"
    except Exception as exc:
        logger.error("readiness.postgres_error", error=str(exc))
        checks["postgres"] = f"error: {exc}"

    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as exc:
        logger.error("readiness.redis_error", error=str(exc))
        checks["redis"] = f"error: {exc}"

    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "ok" if all_ok else "degraded", "checks": checks}

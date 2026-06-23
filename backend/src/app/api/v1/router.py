from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    auth,
    institution,
    items,
    practice,
    progress,
    topics,
    users,
)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(topics.router)
router.include_router(items.router)
router.include_router(practice.router)
router.include_router(progress.router)
router.include_router(users.router)
router.include_router(institution.router)
router.include_router(analytics.router)

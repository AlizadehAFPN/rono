from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://app:dev@localhost:5432/adaptive_learn"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ENVIRONMENT: str = "dev"
    LOG_LEVEL: str = "DEBUG"
    CORS_ORIGINS: str = "http://localhost:3000"

    # Local filesystem storage for user-uploaded media (avatars).
    # Served back as static assets under /api/v1/uploads (see main.py).
    # Backed by a persistent Docker volume in compose so it survives redeploys.
    UPLOAD_DIR: str = "/home/app/uploads"
    MAX_AVATAR_BYTES: int = 5 * 1024 * 1024  # 5 MB
    MAX_QUESTION_IMAGE_BYTES: int = 5 * 1024 * 1024  # 5 MB — per-question image
    # Set false when serving over plain HTTP (e.g. staging ALB without TLS).
    # ECS injects this explicitly; local dev falls back to False via ENVIRONMENT check.
    COOKIE_SECURE: bool | None = None

    @property
    def cookie_secure(self) -> bool:
        if self.COOKIE_SECURE is not None:
            return self.COOKIE_SECURE
        return self.ENVIRONMENT not in ("dev", "test")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env"}


settings = Settings()

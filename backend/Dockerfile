FROM python:3.13-slim

RUN groupadd -r app && useradd -r -g app app

WORKDIR /home/app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY pyproject.toml .
RUN uv sync --no-dev

COPY src /home/app/src
COPY scripts /home/app/scripts
COPY alembic.ini .
COPY alembic /home/app/alembic

# Pre-create the uploads mountpoint owned by app so a fresh named volume inherits
# that ownership (Docker copies the image dir's perms on first volume init),
# letting the non-root app user write avatars.
RUN mkdir -p /home/app/.cache /home/app/uploads && chown -R app:app /home/app

USER app
EXPOSE 8000

ENV PYTHONPATH=src
ENV UV_CACHE_DIR=/home/app/.cache/uv

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

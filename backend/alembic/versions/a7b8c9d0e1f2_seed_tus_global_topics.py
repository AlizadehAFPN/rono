"""seed global TUS subject taxonomy (reference data)

Revision ID: a7b8c9d0e1f2
Revises: f1a2b3c4d5e6
Create Date: 2026-06-19 00:30:00.000000

Inserts the national TUS subject taxonomy as **global** topics
(``institution_id IS NULL``) so every institution shares it. This is reference
data, not user data, and is the only way to reach the private RDS — the deploy
pipeline runs the migration task in-VPC. Idempotent: deterministic UUIDs +
ON CONFLICT DO NOTHING make re-runs safe. Keep in sync with
``scripts/seed_tus_topics.py`` (used for local/dev).
"""

import uuid
from collections.abc import Sequence
from datetime import UTC, datetime

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, insert

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a7b8c9d0e1f2"
down_revision: str | Sequence[str] | None = "f1a2b3c4d5e6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Stable namespace so topic UUIDs (and thus paths) are deterministic across runs.
_TUS_NAMESPACE = uuid.UUID("6f1c2e10-0000-4000-8000-000000000000")

# (name, slug) — must match scripts/seed_tus_topics.py.
_BASIC_SCIENCE_SUBJECTS = [
    ("Anatomi", "tus-anatomi"),
    ("Histoloji ve Embriyoloji", "tus-histoloji-embriyoloji"),
    ("Fizyoloji", "tus-fizyoloji"),
    ("Biyokimya", "tus-biyokimya"),
    ("Mikrobiyoloji", "tus-mikrobiyoloji"),
    ("Patoloji", "tus-patoloji"),
    ("Farmakoloji", "tus-farmakoloji"),
]
_CLINICAL_SCIENCE_SUBJECTS = [
    ("Dahiliye (İç Hastalıkları)", "tus-dahiliye"),
    ("Pediatri", "tus-pediatri"),
    ("Genel Cerrahi", "tus-genel-cerrahi"),
    ("Kadın Hastalıkları ve Doğum", "tus-kadin-dogum"),
    ("Psikiyatri", "tus-psikiyatri"),
    ("Nöroloji", "tus-noroloji"),
    ("Anesteziyoloji ve Reanimasyon", "tus-anesteziyoloji"),
    ("Radyoloji", "tus-radyoloji"),
    ("Halk Sağlığı", "tus-halk-sagligi"),
]

_ALL_SUBJECTS = _BASIC_SCIENCE_SUBJECTS + _CLINICAL_SCIENCE_SUBJECTS


def _topics_table() -> sa.Table:
    return sa.table(
        "topics",
        sa.column("id", UUID(as_uuid=True)),
        sa.column("institution_id", UUID(as_uuid=True)),
        sa.column("parent_id", UUID(as_uuid=True)),
        sa.column("name", sa.String),
        sa.column("slug", sa.String),
        sa.column("path", sa.Text),
        sa.column("level", sa.Integer),
        sa.column("is_active", sa.Boolean),
        sa.column("display_order", sa.Integer),
        sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("updated_at", sa.DateTime(timezone=True)),
    )


def upgrade() -> None:
    topics = _topics_table()
    now = datetime.now(UTC)
    rows = []
    for order, (name, slug) in enumerate(_ALL_SUBJECTS):
        tid = uuid.uuid5(_TUS_NAMESPACE, slug)
        rows.append(
            {
                "id": tid,
                "institution_id": None,
                "parent_id": None,
                "name": name,
                "slug": slug,
                "path": f"/{tid}",
                "level": 0,
                "is_active": True,
                "display_order": order,
                "created_at": now,
                "updated_at": now,
            }
        )
    op.execute(insert(topics).values(rows).on_conflict_do_nothing(index_elements=["id"]))


def downgrade() -> None:
    ids = [str(uuid.uuid5(_TUS_NAMESPACE, slug)) for _, slug in _ALL_SUBJECTS]
    topics = _topics_table()
    op.execute(topics.delete().where(topics.c.id.in_(ids)))

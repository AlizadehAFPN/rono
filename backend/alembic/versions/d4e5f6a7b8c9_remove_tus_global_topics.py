"""remove inert TUS global topics

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-25 00:00:00.000000

Rono is now an employment-exam (آزمون استخدامی) product. The global
(institution_id IS NULL) TUS medical subject topics seeded by a7b8c9d0e1f2 are
inert — no employment item links to them. This removes them.

Safe because items.exam_type now uses the employment codes and item_topic_link
rows cascade on topic delete (ON DELETE CASCADE). Matched by the `tus-` slug
prefix used by the original seed. Downgrade is a no-op: the medical taxonomy is
not restored (the employment seed lives in scripts/seed_estekhdami_topics.py).
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: str | Sequence[str] | None = "c3d4e5f6a7b8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Delete the global TUS subject topics (and cascade their item links)."""
    op.execute(
        "DELETE FROM topics WHERE institution_id IS NULL AND slug LIKE 'tus-%'"
    )


def downgrade() -> None:
    """No-op: the medical taxonomy is intentionally not restored."""
    pass

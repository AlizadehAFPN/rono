"""exam_part, language, provenance fields on items; penalty scoring on sessions

Revision ID: f1a2b3c4d5e6
Revises: e48ce4433ba3
Create Date: 2026-06-19 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f1a2b3c4d5e6"
down_revision: str | Sequence[str] | None = "e48ce4433ba3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # --- items: exam-based section, language, provenance -------------------
    op.add_column("items", sa.Column("exam_part", sa.String(length=30), nullable=True))
    op.add_column(
        "items",
        sa.Column(
            "language", sa.String(length=10), nullable=False, server_default="tr"
        ),
    )
    op.add_column("items", sa.Column("source", sa.String(length=100), nullable=True))
    op.add_column("items", sa.Column("source_reference", sa.String(length=255), nullable=True))
    op.add_column("items", sa.Column("exam_year", sa.Integer(), nullable=True))
    op.add_column("items", sa.Column("exam_session", sa.String(length=20), nullable=True))
    op.create_index(op.f("ix_items_exam_part"), "items", ["exam_part"], unique=False)
    op.create_index(op.f("ix_items_language"), "items", ["language"], unique=False)
    op.create_index(op.f("ix_items_exam_year"), "items", ["exam_year"], unique=False)

    # --- practice_sessions: penalty-adjusted scoring -----------------------
    op.add_column(
        "practice_sessions",
        sa.Column("items_skipped", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "practice_sessions", sa.Column("net_score", sa.Numeric(7, 3), nullable=True)
    )
    op.add_column(
        "practice_sessions", sa.Column("penalty_per_wrong", sa.Numeric(5, 4), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("practice_sessions", "penalty_per_wrong")
    op.drop_column("practice_sessions", "net_score")
    op.drop_column("practice_sessions", "items_skipped")

    op.drop_index(op.f("ix_items_exam_year"), table_name="items")
    op.drop_index(op.f("ix_items_language"), table_name="items")
    op.drop_index(op.f("ix_items_exam_part"), table_name="items")
    op.drop_column("items", "exam_session")
    op.drop_column("items", "exam_year")
    op.drop_column("items", "source_reference")
    op.drop_column("items", "source")
    op.drop_column("items", "language")
    op.drop_column("items", "exam_part")

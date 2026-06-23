"""persistent daily-review target preferences on users

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-22 00:00:00.000000

Adds the learner's editable Daily Review target to the users table. Purely
additive: every column carries a server default (or is nullable) so existing
rows keep working and no answer history / FSRS scheduling is touched.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: str | Sequence[str] | None = "b2c3d4e5f6a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column(
            "daily_target_count", sa.Integer(), nullable=False, server_default="20"
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "daily_limit_type",
            sa.String(length=10),
            nullable=False,
            server_default="count",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "daily_time_limit_minutes",
            sa.Integer(),
            nullable=False,
            server_default="20",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "daily_new_cards_cap", sa.Integer(), nullable=False, server_default="20"
        ),
    )
    op.add_column(
        "users",
        sa.Column("daily_topic_ids", postgresql.JSONB(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("daily_self_rated_level", sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "daily_self_rated_level")
    op.drop_column("users", "daily_topic_ids")
    op.drop_column("users", "daily_new_cards_cap")
    op.drop_column("users", "daily_time_limit_minutes")
    op.drop_column("users", "daily_limit_type")
    op.drop_column("users", "daily_target_count")

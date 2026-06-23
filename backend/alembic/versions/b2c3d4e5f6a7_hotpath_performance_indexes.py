"""hot-path performance indexes (composite/partial) for scale

Revision ID: b2c3d4e5f6a7
Revises: a7b8c9d0e1f2
Create Date: 2026-06-20 00:00:00.000000

Adds composite/partial indexes matched to the highest-frequency query paths.
The existing schema only had single-column indexes; Postgres cannot efficiently
combine two of them for the two-column filters below, so these matter as
card_states (~users x items) and the append-only responses / theta_history
tables grow.

Indexes added:
  1. card_states (user_id, due_at)                  -- "due cards" (every
     dashboard load + session start). Replaces reliance on two separate
     single-column indexes.
  2. responses (user_id, item_id) WHERE graded      -- IRT theta re-estimation
     on EVERY answer submit; partial keeps it small by excluding skipped /
     ungraded rows.
  3. items (institution_id, status) WHERE not deleted -- candidate item
     selection on every question served.
  4. responses (user_id, created_at)                -- dashboard activity heatmap.
  5. theta_history (user_id, topic_id, created_at)  -- ability trend chart
     (filters topic_id IS NULL, orders by created_at).

Built as plain transactional CREATE INDEX IF NOT EXISTS. NOTE: this project's
Alembic env runs in async mode (asyncpg), under which Alembic's
`autocommit_block()` is unsupported and raises AssertionError — so CONCURRENTLY
(which requires running outside a transaction) cannot be used here. On the
current dataset the tables are small, so the short ACCESS EXCLUSIVE lock during
build is negligible. If/when a table grows large enough that the build lock
matters, run that index's CONCURRENTLY build out-of-band via a one-off sync
(psycopg) connection rather than through the async migration runner.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: str | Sequence[str] | None = "a7b8c9d0e1f2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create hot-path indexes (plain transactional DDL; async-env compatible)."""
    # 1. Due-card scheduling: WHERE user_id = ? AND due_at <= now
    op.create_index(
        "ix_card_states_user_due",
        "card_states",
        ["user_id", "due_at"],
        unique=False,
        if_not_exists=True,
    )

    # 2. IRT theta recompute: WHERE user_id = ? AND is_correct IS NOT NULL
    #    AND was_skipped = false  (join back to items on item_id)
    op.create_index(
        "ix_responses_user_graded",
        "responses",
        ["user_id", "item_id"],
        unique=False,
        if_not_exists=True,
        postgresql_where=sa.text("was_skipped = false AND is_correct IS NOT NULL"),
    )

    # 3. Candidate item selection: WHERE institution_id = ? AND status = ?
    #    AND deleted_at IS NULL
    op.create_index(
        "ix_items_institution_status_active",
        "items",
        ["institution_id", "status"],
        unique=False,
        if_not_exists=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )

    # 4. Activity heatmap: WHERE user_id = ? AND created_at >= ?
    op.create_index(
        "ix_responses_user_created_at",
        "responses",
        ["user_id", "created_at"],
        unique=False,
        if_not_exists=True,
    )

    # 5. Ability trend: WHERE user_id = ? AND topic_id IS NULL
    #    ORDER BY created_at DESC
    op.create_index(
        "ix_theta_history_user_topic_created",
        "theta_history",
        ["user_id", "topic_id", "created_at"],
        unique=False,
        if_not_exists=True,
    )


def downgrade() -> None:
    """Drop hot-path indexes."""
    op.drop_index("ix_theta_history_user_topic_created", table_name="theta_history", if_exists=True)
    op.drop_index("ix_responses_user_created_at", table_name="responses", if_exists=True)
    op.drop_index("ix_items_institution_status_active", table_name="items", if_exists=True)
    op.drop_index("ix_responses_user_graded", table_name="responses", if_exists=True)
    op.drop_index("ix_card_states_user_due", table_name="card_states", if_exists=True)

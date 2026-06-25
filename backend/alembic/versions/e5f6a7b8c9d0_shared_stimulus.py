"""shared stimulus passages

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-06-25 15:30:00.000000

Adds a `stimuli` table (a shared reading passage / scenario) and links items to
it via two nullable columns on `items`. Nullable + ON DELETE SET NULL keeps all
existing questions unaffected and never deletes a question when a passage is
removed.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e5f6a7b8c9d0"
down_revision: str | Sequence[str] | None = "d4e5f6a7b8c9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "stimuli",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("institution_id", sa.UUID(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("media_attachments", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("language", sa.String(length=10), nullable=False),
        sa.Column("source_reference", sa.String(length=255), nullable=True),
        sa.Column("group_no", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["institution_id"], ["institutions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_stimuli_institution_id"), "stimuli", ["institution_id"], unique=False
    )

    op.add_column("items", sa.Column("stimulus_id", sa.UUID(), nullable=True))
    op.add_column("items", sa.Column("stimulus_order", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_items_stimulus_id"), "items", ["stimulus_id"], unique=False)
    op.create_index(
        "ix_items_stimulus_order", "items", ["stimulus_id", "stimulus_order"], unique=False
    )
    op.create_foreign_key(
        "fk_items_stimulus_id",
        "items",
        "stimuli",
        ["stimulus_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("fk_items_stimulus_id", "items", type_="foreignkey")
    op.drop_index("ix_items_stimulus_order", table_name="items")
    op.drop_index(op.f("ix_items_stimulus_id"), table_name="items")
    op.drop_column("items", "stimulus_order")
    op.drop_column("items", "stimulus_id")
    op.drop_index(op.f("ix_stimuli_institution_id"), table_name="stimuli")
    op.drop_table("stimuli")

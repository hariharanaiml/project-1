"""ai analysis repair fields

Revision ID: h4a1f2e3b8c9
Revises: ccc27b6f1a06
Create Date: 2026-08-01 22:30:00.000000

Adds repair-estimate columns to `ai_analyses` and renames the `confidence`
column to `confidence_score` to match the Milestone 5 API contract.

Down-revision is the initial schema (ccc27b6f1a06).
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "h4a1f2e3b8c9"
down_revision: Union[str, None] = "ccc27b6f1a06"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply the migration."""
    # Rename `confidence` → `confidence_score` (SQLite batch mode).
    with op.batch_alter_table("ai_analyses", schema=None) as batch_op:
        batch_op.alter_column(
            "confidence",
            new_column_name="confidence_score",
            existing_type=sa.Float(),
            nullable=True,
        )
        batch_op.add_column(sa.Column("repair_cost", sa.Numeric(precision=12, scale=2), nullable=True))
        batch_op.add_column(sa.Column("repair_recommendation", sa.Text(), nullable=True))


def downgrade() -> None:
    """Revert the migration."""
    with op.batch_alter_table("ai_analyses", schema=None) as batch_op:
        batch_op.drop_column("repair_recommendation")
        batch_op.drop_column("repair_cost")
        batch_op.alter_column(
            "confidence_score",
            new_column_name="confidence",
            existing_type=sa.Float(),
            nullable=True,
        )


"""add_goal_description

Revision ID: 69fbda9f2ea9
Revises: 78c722921263
Create Date: 2026-01-15 22:56:19.634511

NOTE: Seed data moved to scripts/seed/data/goals.py
Run `python -m scripts.seed.main` to populate goals data.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '69fbda9f2ea9'
down_revision: Union[str, Sequence[str], None] = '78c722921263'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - add description column and change icon_url to TEXT."""
    # 1. Add description column
    op.add_column('goals', sa.Column('description', sa.String(length=255), nullable=True))

    # 2. Change icon_url to Text to support Base64
    op.alter_column('goals', 'icon_url', type_=sa.Text())

    # 3. Add unique constraint on name for upsert support
    op.create_index('ix_goals_name_unique', 'goals', ['name'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Drop unique index
    op.drop_index('ix_goals_name_unique', table_name='goals')

    # 2. Drop description column
    op.drop_column('goals', 'description')

    # 3. Revert icon_url type to String(255)
    op.alter_column('goals', 'icon_url', type_=sa.String(255))

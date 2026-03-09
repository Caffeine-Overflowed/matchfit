"""seed_sports_data

Revision ID: ce24fcdbe59f
Revises: dfbda5f5e16c
Create Date: 2026-01-15 10:25:46.271396

NOTE: Seed data moved to scripts/seed/data/sports.py
Run `python -m scripts.seed.main` to populate sports data.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce24fcdbe59f'
down_revision: Union[str, Sequence[str], None] = 'dfbda5f5e16c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - change icon_url to TEXT for base64."""
    op.alter_column('sports', 'icon_url', type_=sa.Text())


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('sports', 'icon_url', type_=sa.String(255))

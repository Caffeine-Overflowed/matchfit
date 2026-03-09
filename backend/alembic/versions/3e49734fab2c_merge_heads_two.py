"""merge heads two

Revision ID: 3e49734fab2c
Revises: a10e73323fb1, f1a2b3c4d5e6
Create Date: 2026-01-14 12:00:16.169366

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e49734fab2c'
down_revision: Union[str, Sequence[str], None] = ('a10e73323fb1', 'f1a2b3c4d5e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

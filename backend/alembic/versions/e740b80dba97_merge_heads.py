"""merge heads

Revision ID: e740b80dba97
Revises: 7cc916ce015a, 8d4c7c7e38a1
Create Date: 2026-01-14 11:04:09.458140

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e740b80dba97'
down_revision: Union[str, Sequence[str], None] = ('7cc916ce015a', '8d4c7c7e38a1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

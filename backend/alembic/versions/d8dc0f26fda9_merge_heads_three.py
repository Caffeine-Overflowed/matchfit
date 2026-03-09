"""merge heads three

Revision ID: d8dc0f26fda9
Revises: a1b2c3d4e5f6, b5b08db33120, d858ea0419a0
Create Date: 2026-01-14 22:38:18.004103

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8dc0f26fda9'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6', 'b5b08db33120', 'd858ea0419a0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

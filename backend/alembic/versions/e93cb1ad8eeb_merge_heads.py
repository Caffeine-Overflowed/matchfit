"""merge_heads

Revision ID: e93cb1ad8eeb
Revises: a1b2c3d4e5f6, b5b08db33120
Create Date: 2026-01-14 20:44:40.061754

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e93cb1ad8eeb'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6', 'b5b08db33120')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

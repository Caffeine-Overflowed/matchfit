"""merge_heads

Revision ID: 1d161a610d29
Revises: 77c8f8d373b8, afd642ddfbaa
Create Date: 2026-01-16 20:26:51.771511

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d161a610d29'
down_revision: Union[str, Sequence[str], None] = ('77c8f8d373b8', 'afd642ddfbaa')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

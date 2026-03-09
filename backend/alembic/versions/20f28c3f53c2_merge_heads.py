"""merge heads

Revision ID: 20f28c3f53c2
Revises: 564914fa2257, db9625235aff
Create Date: 2026-01-16 13:58:58.094577

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20f28c3f53c2'
down_revision: Union[str, Sequence[str], None] = ('564914fa2257', 'db9625235aff')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

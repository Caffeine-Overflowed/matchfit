"""merge messenger and postgis migrations

Revision ID: aaeec9ded446
Revises: dfbda5f5e16c, e40e0e7e2820
Create Date: 2026-01-15 10:12:48.650675

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aaeec9ded446'
down_revision: Union[str, Sequence[str], None] = ('dfbda5f5e16c', 'e40e0e7e2820')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

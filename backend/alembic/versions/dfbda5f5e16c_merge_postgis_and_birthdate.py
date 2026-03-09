"""merge postgis and birthdate

Revision ID: dfbda5f5e16c
Revises: b1bec49399f8, g1h2i3j4k5l6
Create Date: 2026-01-15 09:04:09.685707

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dfbda5f5e16c'
down_revision: Union[str, Sequence[str], None] = ('b1bec49399f8', 'g1h2i3j4k5l6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

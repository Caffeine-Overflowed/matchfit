"""merge all heads

Revision ID: 6b07a82adc84
Revises: 1fe590117cab, 555d9802c806, c3dd0eb97e4a, f2g3h4i5j6k7
Create Date: 2026-01-15 20:10:19.477048

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b07a82adc84'
down_revision: Union[str, Sequence[str], None] = ('1fe590117cab', 'c3dd0eb97e4a', 'f2g3h4i5j6k7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

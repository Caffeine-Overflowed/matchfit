"""make_icon_url_required

Revision ID: f2g3h4i5j6k7
Revises: ce24fcdbe59f
Create Date: 2026-01-15 12:33:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2g3h4i5j6k7'
down_revision: Union[str, Sequence[str], None] = 'ce24fcdbe59f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make icon_url NOT NULL."""
    op.alter_column(
        'sports',
        'icon_url',
        existing_type=sa.Text(),
        nullable=False
    )


def downgrade() -> None:
    """Revert icon_url to nullable."""
    op.alter_column(
        'sports',
        'icon_url',
        existing_type=sa.Text(),
        nullable=True
    )

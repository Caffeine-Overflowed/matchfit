"""add chronotype to profiles

Revision ID: 9920b6f7932a
Revises: 20f28c3f53c2
Create Date: 2026-01-16 18:14:48.029575

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9920b6f7932a'
down_revision: Union[str, Sequence[str], None] = '20f28c3f53c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'profiles',
        sa.Column(
            'chronotype',
            sa.Enum('EARLY_BIRD', 'NIGHT_OWL', 'PIGEON', name='chronotype', native_enum=False),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('profiles', 'chronotype')

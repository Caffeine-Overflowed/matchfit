"""add_bio_and_languages_to_profile

Revision ID: e5508f51c61e
Revises: a63319362e41
Create Date: 2026-01-16 10:12:06.103596

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e5508f51c61e'
down_revision: Union[str, Sequence[str], None] = 'a63319362e41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('profiles', sa.Column('bio', sa.String(length=500), server_default='', nullable=False))
    op.add_column('profiles', sa.Column('languages', postgresql.ARRAY(sa.String(length=5)), server_default='{}', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('profiles', 'languages')
    op.drop_column('profiles', 'bio')

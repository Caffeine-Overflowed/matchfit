"""make_chronotype_required

Revision ID: 3a2a0500089f
Revises: 9920b6f7932a
Create Date: 2026-01-16 18:19:21.872149

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '3a2a0500089f'
down_revision: Union[str, Sequence[str], None] = '9920b6f7932a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Set default value for existing rows
    op.execute("UPDATE profiles SET chronotype = 'PIGEON' WHERE chronotype IS NULL")
    # Make column NOT NULL
    op.alter_column('profiles', 'chronotype', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('profiles', 'chronotype', nullable=True)

"""make password_hash required

Revision ID: afd642ddfbaa
Revises: 3a2a0500089f
Create Date: 2026-01-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'afd642ddfbaa'
down_revision: Union[str, None] = '3a2a0500089f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Bcrypt hash of 'T3$tT3$t'
DEFAULT_PASSWORD_HASH = '$2b$12$5B4AW9mtylFBdQ0gHDXgiu3JTXAkbGxe9/tQlWBls8NcQCVujT0qe'


def upgrade() -> None:
    # Set default password hash for users with NULL password_hash
    op.execute(
        sa.text(
            "UPDATE users SET password_hash = :hash WHERE password_hash IS NULL"
        ).bindparams(hash=DEFAULT_PASSWORD_HASH)
    )

    # Make password_hash NOT NULL
    op.alter_column('users', 'password_hash',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)


def downgrade() -> None:
    # Make password_hash nullable again
    op.alter_column('users', 'password_hash',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)

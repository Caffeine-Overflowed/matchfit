"""add_match_unique_constraint_and_matched_at

Revision ID: 4f8a2b9c1e0d
Revises: 1d161a610d29
Create Date: 2026-07-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f8a2b9c1e0d'
down_revision: Union[str, Sequence[str], None] = '1d161a610d29'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove duplicate (user_id, target_id) rows accumulated before the unique
    # constraint existed, keeping the row that carries a chat/match if any.
    op.execute("""
        DELETE FROM matches
        WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (
                    PARTITION BY user_id, target_id
                    ORDER BY (chat_id IS NOT NULL) DESC, is_match DESC, created_at
                ) AS rn
                FROM matches
            ) ranked
            WHERE ranked.rn > 1
        )
    """)
    op.create_unique_constraint('uq_matches_user_target', 'matches', ['user_id', 'target_id'])
    op.add_column('matches', sa.Column('matched_at', sa.DateTime(timezone=True), nullable=True))
    # Matches formed before this column existed: approximate with created_at
    op.execute("UPDATE matches SET matched_at = created_at WHERE is_match = true")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('matches', 'matched_at')
    op.drop_constraint('uq_matches_user_target', 'matches', type_='unique')

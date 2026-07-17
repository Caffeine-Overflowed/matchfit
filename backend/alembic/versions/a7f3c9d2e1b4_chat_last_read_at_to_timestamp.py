"""chat last_read_at from message id to timestamp

Revision ID: a7f3c9d2e1b4
Revises: 4f8a2b9c1e0d
Create Date: 2026-07-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a7f3c9d2e1b4"
down_revision: Union[str, Sequence[str], None] = "4f8a2b9c1e0d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "chat_participations",
        sa.Column("last_read_at_ts", sa.DateTime(timezone=True), nullable=True),
    )
    # The old last_read_at held the last-read message id; carry over that
    # message's sent_at as the new read timestamp.
    op.execute(
        """
        UPDATE chat_participations cp
        SET last_read_at_ts = m.sent_at
        FROM messages m
        WHERE m.id = cp.last_read_at
        """
    )
    # Dropping the column also drops its FK to messages and its index.
    op.drop_column("chat_participations", "last_read_at")
    op.alter_column(
        "chat_participations", "last_read_at_ts", new_column_name="last_read_at"
    )


def downgrade() -> None:
    op.add_column(
        "chat_participations",
        sa.Column("last_read_at_ts", sa.String(length=36), nullable=True),
    )
    op.drop_column("chat_participations", "last_read_at")
    op.alter_column(
        "chat_participations", "last_read_at_ts", new_column_name="last_read_at"
    )
    op.create_foreign_key(
        "chat_participations_last_read_at_fkey",
        "chat_participations",
        "messages",
        ["last_read_at"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_chat_participations_last_read_at",
        "chat_participations",
        ["last_read_at"],
    )

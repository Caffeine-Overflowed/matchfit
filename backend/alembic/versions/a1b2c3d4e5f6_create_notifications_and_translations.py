"""create notifications and translations tables

Revision ID: a1b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-01-14 12:00:00.000000

NOTE: Seed data moved to scripts/seed/data/translations.py
Run `python -m scripts.seed.main` to populate translations data.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создание enum для типов уведомлений
    notification_type_enum = postgresql.ENUM(
        "NEW_MATCH",
        "MATCH_CONFIRMED",
        "MATCH_DECLINED",
        "EVENT_STATUS_CHANGED",
        "EVENT_UPDATED",
        "EVENT_CANCELLED",
        "EVENT_REMINDER",
        "NEW_PARTICIPANT",
        "PARTICIPANT_LEFT",
        "NEW_REVIEW",
        "SYSTEM_MESSAGE",
        name="notificationtype",
    )
    notification_type_enum.create(op.get_bind())

    # Создание таблицы notifications
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column(
            "type",
            postgresql.ENUM(name="notificationtype", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "payload",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Индексы для notifications
    op.create_index(
        "ix_notifications_user_created",
        "notifications",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_notifications_user_unread",
        "notifications",
        ["user_id", "read_at"],
        unique=False,
        postgresql_where=sa.text("read_at IS NULL"),
    )

    # Создание таблицы translations
    op.create_table(
        "translations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "entity_type", "key", "locale", name="uq_translation_entity_key_locale"
        ),
    )

    op.create_index(
        "ix_translations_entity_key",
        "translations",
        ["entity_type", "key"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_translations_entity_key", table_name="translations")
    op.drop_table("translations")

    op.drop_index("ix_notifications_user_unread", table_name="notifications")
    op.drop_index("ix_notifications_user_created", table_name="notifications")
    op.drop_table("notifications")

    # Удаление enum
    notification_type_enum = postgresql.ENUM(name="notificationtype")
    notification_type_enum.drop(op.get_bind())

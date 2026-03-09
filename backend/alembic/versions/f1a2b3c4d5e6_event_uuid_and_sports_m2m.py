"""event uuid and sports m2m

Revision ID: f1a2b3c4d5e6
Revises: e740b80dba97
Create Date: 2026-01-14
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'e740b80dba97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Drop FK from sports to sport_categories
    op.drop_constraint('sports_category_id_fkey', 'sports', type_='foreignkey')
    op.drop_column('sports', 'category_id')

    # 2. Drop sport_categories table
    op.drop_index('ix_sport_categories_id', table_name='sport_categories')
    op.drop_table('sport_categories')

    # 3. Drop FK from events.sport_id
    op.drop_constraint('events_sport_id_fkey', 'events', type_='foreignkey')
    op.drop_column('events', 'sport_id')

    # 4. Change events.id from int to varchar(36)
    op.drop_index('ix_events_id', table_name='events')
    op.execute('ALTER TABLE events ALTER COLUMN id TYPE varchar(36) USING id::text')
    op.execute("ALTER TABLE events ALTER COLUMN id SET DEFAULT NULL")
    op.execute("DROP SEQUENCE IF EXISTS events_id_seq")

    # 5. Create event_sports association table
    op.create_table(
        'event_sports',
        sa.Column('event_id', sa.String(36), sa.ForeignKey('events.id'), primary_key=True),
        sa.Column('sport_id', sa.Integer(), sa.ForeignKey('sports.id'), primary_key=True),
    )


def downgrade() -> None:
    # Drop event_sports
    op.drop_table('event_sports')

    # Restore events.id to integer (will lose data!)
    op.execute('ALTER TABLE events ALTER COLUMN id TYPE integer USING 1')
    op.execute("CREATE SEQUENCE events_id_seq OWNED BY events.id")
    op.execute("ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq')")
    op.create_index('ix_events_id', 'events', ['id'])

    # Restore events.sport_id
    op.add_column('events', sa.Column('sport_id', sa.Integer(), nullable=True))
    op.create_foreign_key('events_sport_id_fkey', 'events', 'sports', ['sport_id'], ['id'])

    # Restore sport_categories
    op.create_table(
        'sport_categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('icon_url', sa.String(255), nullable=True),
    )
    op.create_index('ix_sport_categories_id', 'sport_categories', ['id'])

    # Restore sports.category_id
    op.add_column('sports', sa.Column('category_id', sa.Integer(), nullable=True))
    op.create_foreign_key('sports_category_id_fkey', 'sports', 'sport_categories', ['category_id'], ['id'])

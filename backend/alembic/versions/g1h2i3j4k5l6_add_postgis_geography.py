"""add postgis geography

Revision ID: g1h2i3j4k5l6
Revises: e93cb1ad8eeb
Create Date: 2026-01-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography
from sqlalchemy.dialects import postgresql


revision: str = 'g1h2i3j4k5l6'
down_revision: Union[str, None] = 'e93cb1ad8eeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable PostGIS extension
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')

    # 2. Events: drop location_data JSONB, add location Geography (no address)
    op.drop_column('events', 'location_data')
    op.add_column(
        'events',
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=False)
    )
    op.create_index(
        'ix_events_location',
        'events',
        ['location'],
        postgresql_using='gist'
    )

    # 3. Profiles: drop location String, add location Geography (no address)
    op.drop_column('profiles', 'location')
    op.add_column(
        'profiles',
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=True)
    )
    op.create_index(
        'ix_profiles_location',
        'profiles',
        ['location'],
        postgresql_using='gist'
    )

    # 4. Profiles: make weight and height nullable
    op.alter_column('profiles', 'weight', existing_type=sa.Float(), nullable=True)
    op.alter_column('profiles', 'height', existing_type=sa.Float(), nullable=True)


def downgrade() -> None:
    # Profiles: restore weight and height as NOT NULL
    op.alter_column('profiles', 'height', existing_type=sa.Float(), nullable=False)
    op.alter_column('profiles', 'weight', existing_type=sa.Float(), nullable=False)

    # Profiles: restore String location, drop Geography
    op.drop_index('ix_profiles_location', table_name='profiles')
    op.drop_column('profiles', 'location')
    op.add_column(
        'profiles',
        sa.Column('location', sa.String(255), nullable=False, server_default='')
    )
    op.execute("ALTER TABLE profiles ALTER COLUMN location DROP DEFAULT")

    # Events: restore JSONB location_data, drop Geography
    op.drop_index('ix_events_location', table_name='events')
    op.drop_column('events', 'location')
    op.add_column(
        'events',
        sa.Column('location_data', postgresql.JSONB(), nullable=False, server_default='{}')
    )
    op.execute("ALTER TABLE events ALTER COLUMN location_data DROP DEFAULT")

    # Note: PostGIS extension is not dropped in downgrade (might be used by other tables)

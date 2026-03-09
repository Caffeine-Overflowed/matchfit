"""fix_sports_icons

Revision ID: a63319362e41
Revises: 69fbda9f2ea9
Create Date: 2026-01-15 23:19:26.407073

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a63319362e41'
down_revision: Union[str, Sequence[str], None] = '69fbda9f2ea9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


import base64
from pathlib import Path

# Path to static/sports (with fallback for compatibility)
_old_path = Path(__file__).parent.parent.parent / 'static' / 'sports'
_new_path = Path(__file__).parent.parent / 'static' / 'sports'
STATIC_SPORTS_DIR = _old_path if _old_path.exists() else _new_path

SPORTS = [
    ('Football', 'football.svg'),
    ('Basketball', 'basketball.svg'),
    ('Tennis', 'tennis.svg'),
    ('Swimming', 'swimming.svg'),
    ('Running', 'running.svg'),
    ('Cycling', 'cycling.svg'),
    ('Hiking', 'hiking.svg'),
    ('Yoga', 'yoga.svg'),
    ('Gym', 'gym.svg'),
    ('Volleyball', 'volleyball.svg'),
    ('Boxing', 'boxing.svg'),
    ('Martial Arts', 'martial_arts.svg'),
    ('Surfing', 'surfing.svg'),
    ('Skiing', 'skiing.svg'),
    ('Snowboarding', 'snowboarding.svg'),
]

FALLBACK_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=="

def svg_to_base64_safe(filename: str) -> str:
    """Read SVG and return Base64, or fallback if missing."""
    filepath = STATIC_SPORTS_DIR / filename
    if not filepath.exists():
        print(f"WARNING: File not found {filepath}, using fallback.")
        return FALLBACK_ICON
    
    try:
        svg_content = filepath.read_bytes()
        b64 = base64.b64encode(svg_content).decode('utf-8')
        return f"data:image/svg+xml;base64,{b64}"
    except Exception as e:
        print(f"ERROR: Reading {filepath}: {e}, using fallback.")
        return FALLBACK_ICON

def upgrade() -> None:
    """Upgrade schema."""
    # Force update all sports icons
    sports_table = sa.table(
        'sports',
        sa.column('name', sa.String),
        sa.column('icon_url', sa.Text)
    )
    
    # Check if directory exists at all (important for Docker debugging)
    if not STATIC_SPORTS_DIR.exists():
        print(f"CRITICAL WARNING: Static dir {STATIC_SPORTS_DIR} does not exist!")
    
    for name, filename in SPORTS:
        icon_data = svg_to_base64_safe(filename)
        # Update specific sport
        op.execute(
            sports_table.update().where(
                sports_table.c.name == name
            ).values(icon_url=icon_data)
        )

def downgrade() -> None:
    """Downgrade schema.

    Note: This migration only updates icon_url values to base64 format.
    Previous values are not preserved, so downgrade sets fallback icons.
    The original seed migration (ce24fcdbe59f) also uses base64, so this is safe.
    """
    sports_table = sa.table(
        'sports',
        sa.column('name', sa.String),
        sa.column('icon_url', sa.Text)
    )

    for name, _ in SPORTS:
        op.execute(
            sports_table.update().where(
                sports_table.c.name == name
            ).values(icon_url=FALLBACK_ICON)
        )

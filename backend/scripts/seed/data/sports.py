"""
Seed data for sports.

Original source: alembic/versions/ce24fcdbe59f_seed_sports_data.py
SVG icons stored in: alembic/static/sports/
"""

# Sport name -> SVG filename mapping
SPORTS_DATA = [
    {"name": "Football", "icon_file": "football.svg"},
    {"name": "Basketball", "icon_file": "basketball.svg"},
    {"name": "Tennis", "icon_file": "tennis.svg"},
    {"name": "Swimming", "icon_file": "swimming.svg"},
    {"name": "Running", "icon_file": "running.svg"},
    {"name": "Cycling", "icon_file": "cycling.svg"},
    {"name": "Hiking", "icon_file": "hiking.svg"},
    {"name": "Yoga", "icon_file": "yoga.svg"},
    {"name": "Gym", "icon_file": "gym.svg"},
    {"name": "Volleyball", "icon_file": "volleyball.svg"},
    {"name": "Boxing", "icon_file": "boxing.svg"},
    {"name": "Martial Arts", "icon_file": "martial_arts.svg"},
    {"name": "Surfing", "icon_file": "surfing.svg"},
    {"name": "Skiing", "icon_file": "skiing.svg"},
    {"name": "Snowboarding", "icon_file": "snowboarding.svg"},
]

# Default placeholder icon (gray circle) if SVG file not found
DEFAULT_ICON_B64 = (
    "data:image/svg+xml;base64,"
    "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0"
    "PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIg"
    "ZmlsbD0iI2NjYyIvPjwvc3ZnPg=="
)

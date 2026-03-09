"""
Seed data for goals.

Original source: alembic/versions/69fbda9f2ea9_add_goal_description.py
SVG icons stored in: alembic/static/goals/
"""

# Goal data with descriptions and icon filenames
GOALS_DATA = [
    {
        "name": "Lose Weight",
        "description": "Focus on cardio and calorie deficit to shed pounds.",
        "icon_file": "lose_weight.svg",
    },
    {
        "name": "Gain Mass",
        "description": "Hypertrophy training and high-protein diet to build muscle.",
        "icon_file": "gain_mass.svg",
    },
    {
        "name": "Run Marathon",
        "description": "Endurance training to prepare for long-distance running.",
        "icon_file": "marathon.svg",
    },
    {
        "name": "Find Partner",
        "description": "Looking for a gym buddy or running partner.",
        "icon_file": "partner.svg",
    },
    {
        "name": "De-stress",
        "description": "Physical activity to reduce mental stress and improve mood.",
        "icon_file": "stress.svg",
    },
    {
        "name": "Learn Skill",
        "description": "Mastering a new sport or activity from scratch.",
        "icon_file": "skill.svg",
    },
]

# Default placeholder icon (gray circle) if SVG file not found
DEFAULT_ICON_B64 = (
    "data:image/svg+xml;base64,"
    "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0"
    "PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIg"
    "ZmlsbD0iI2NjYyIvPjwvc3ZnPg=="
)

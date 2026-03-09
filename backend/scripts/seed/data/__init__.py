"""Seed data definitions."""
from .users import SEED_USERS
from .events import SEED_EVENTS
from .matches import MUTUAL_MATCHES, ONE_SIDED_LIKES
from .messages import MATCH_MESSAGES, EVENT_MESSAGES
from .sports import SPORTS_DATA, DEFAULT_ICON_B64 as SPORTS_DEFAULT_ICON
from .goals import GOALS_DATA, DEFAULT_ICON_B64 as GOALS_DEFAULT_ICON
from .translations import TRANSLATIONS_DATA, NOTIFICATION_TYPES

__all__ = [
    # Test users and profiles
    "SEED_USERS",
    # Test events
    "SEED_EVENTS",
    # Test matches
    "MUTUAL_MATCHES",
    "ONE_SIDED_LIKES",
    # Test messages
    "MATCH_MESSAGES",
    "EVENT_MESSAGES",
    # Reference data (from migrations)
    "SPORTS_DATA",
    "SPORTS_DEFAULT_ICON",
    "GOALS_DATA",
    "GOALS_DEFAULT_ICON",
    "TRANSLATIONS_DATA",
    "NOTIFICATION_TYPES",
]

from enum import Enum, unique


@unique
class NotificationType(str, Enum):
    """Типы уведомлений в системе."""

    # Матчинг
    NEW_MATCH = "NEW_MATCH"
    MATCH_CONFIRMED = "MATCH_CONFIRMED"
    MATCH_DECLINED = "MATCH_DECLINED"

    # События
    EVENT_STATUS_CHANGED = "EVENT_STATUS_CHANGED"
    EVENT_UPDATED = "EVENT_UPDATED"
    EVENT_CANCELLED = "EVENT_CANCELLED"
    EVENT_REMINDER = "EVENT_REMINDER"

    # Участники
    NEW_PARTICIPANT = "NEW_PARTICIPANT"
    PARTICIPANT_LEFT = "PARTICIPANT_LEFT"

    # Система
    SYSTEM_MESSAGE = "SYSTEM_MESSAGE"

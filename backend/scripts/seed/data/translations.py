"""
Seed data for translations.

Original source: alembic/versions/a1b2c3d4e5f6_create_notifications_and_translations.py

Placeholders used in notification texts:
- {name} - user name (for matches)
- {user_name} - participant name
- {event_title} - event title
- {old_status}, {new_status} - event status change
- {time_until} - time until event
- {reviewer_name} - review author
- {message} - system message text
"""

# Notification translations
# Format: (entity_type, key, locale, value)
TRANSLATIONS_DATA = [
    # ==================== RUSSIAN (ru) ====================
    # Notification titles
    ("notification_title", "NEW_MATCH", "ru", "Новый матч!"),
    ("notification_title", "MATCH_CONFIRMED", "ru", "Матч подтвержден"),
    ("notification_title", "MATCH_DECLINED", "ru", "Матч отклонен"),
    ("notification_title", "EVENT_STATUS_CHANGED", "ru", "Статус события изменен"),
    ("notification_title", "EVENT_UPDATED", "ru", "Событие обновлено"),
    ("notification_title", "EVENT_CANCELLED", "ru", "Событие отменено"),
    ("notification_title", "EVENT_REMINDER", "ru", "Напоминание о событии"),
    ("notification_title", "NEW_PARTICIPANT", "ru", "Новый участник"),
    ("notification_title", "PARTICIPANT_LEFT", "ru", "Участник покинул событие"),
    ("notification_title", "NEW_REVIEW", "ru", "Новый отзыв"),
    ("notification_title", "SYSTEM_MESSAGE", "ru", "Системное сообщение"),
    # Notification message templates
    ("notification_type", "NEW_MATCH", "ru", 'У вас новый мэтч с "{name}"'),
    ("notification_type", "MATCH_CONFIRMED", "ru", '{user_name} подтвердил участие в "{event_title}"'),
    ("notification_type", "MATCH_DECLINED", "ru", '{user_name} отклонил участие в "{event_title}"'),
    ("notification_type", "EVENT_STATUS_CHANGED", "ru", 'Статус события "{event_title}" изменен с {old_status} на {new_status}'),
    ("notification_type", "EVENT_UPDATED", "ru", 'Событие "{event_title}" было обновлено'),
    ("notification_type", "EVENT_CANCELLED", "ru", 'Событие "{event_title}" отменено'),
    ("notification_type", "EVENT_REMINDER", "ru", 'Напоминание: событие "{event_title}" начнется через {time_until}'),
    ("notification_type", "NEW_PARTICIPANT", "ru", '{user_name} присоединился к событию "{event_title}"'),
    ("notification_type", "PARTICIPANT_LEFT", "ru", '{user_name} покинул событие "{event_title}"'),
    ("notification_type", "NEW_REVIEW", "ru", '{reviewer_name} оставил отзыв о событии "{event_title}"'),
    ("notification_type", "SYSTEM_MESSAGE", "ru", "{message}"),

    # ==================== ENGLISH (en) ====================
    # Notification titles
    ("notification_title", "NEW_MATCH", "en", "New match!"),
    ("notification_title", "MATCH_CONFIRMED", "en", "Match confirmed"),
    ("notification_title", "MATCH_DECLINED", "en", "Match declined"),
    ("notification_title", "EVENT_STATUS_CHANGED", "en", "Event status changed"),
    ("notification_title", "EVENT_UPDATED", "en", "Event updated"),
    ("notification_title", "EVENT_CANCELLED", "en", "Event cancelled"),
    ("notification_title", "EVENT_REMINDER", "en", "Event reminder"),
    ("notification_title", "NEW_PARTICIPANT", "en", "New participant"),
    ("notification_title", "PARTICIPANT_LEFT", "en", "Participant left"),
    ("notification_title", "NEW_REVIEW", "en", "New review"),
    ("notification_title", "SYSTEM_MESSAGE", "en", "System message"),
    # Notification message templates
    ("notification_type", "NEW_MATCH", "en", 'You have a new match with user "{name}"'),
    ("notification_type", "MATCH_CONFIRMED", "en", '{user_name} confirmed participation in "{event_title}"'),
    ("notification_type", "MATCH_DECLINED", "en", '{user_name} declined participation in "{event_title}"'),
    ("notification_type", "EVENT_STATUS_CHANGED", "en", 'Status of "{event_title}" changed from {old_status} to {new_status}'),
    ("notification_type", "EVENT_UPDATED", "en", 'Event "{event_title}" was updated'),
    ("notification_type", "EVENT_CANCELLED", "en", 'Event "{event_title}" was cancelled'),
    ("notification_type", "EVENT_REMINDER", "en", 'Reminder: event "{event_title}" starts in {time_until}'),
    ("notification_type", "NEW_PARTICIPANT", "en", '{user_name} joined event "{event_title}"'),
    ("notification_type", "PARTICIPANT_LEFT", "en", '{user_name} left event "{event_title}"'),
    ("notification_type", "NEW_REVIEW", "en", '{reviewer_name} left a review for event "{event_title}"'),
    ("notification_type", "SYSTEM_MESSAGE", "en", "{message}"),
]

# Notification types enum values (for reference)
NOTIFICATION_TYPES = [
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
]

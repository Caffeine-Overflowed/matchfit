from app.extensions.errors.base import BaseDomainError


class EventStartTimeInPastError(BaseDomainError):
    """Время начала события не может быть в прошлом."""

    CODE = "event_start_time_in_past"


class EventEndTimeBeforeStartError(BaseDomainError):
    """Время окончания должно быть позже времени начала."""


    CODE = "event_end_time_before_start"


class EventNotFoundError(BaseDomainError):
    """Событие не найдено."""

    CODE = "event_not_found"


class UserAlreadyParticipantError(BaseDomainError):
    """Пользователь уже является участником события."""
    CODE = "user_already_participant"


class EventIsFullError(BaseDomainError):
    """Мероприятие заполнено."""
    CODE = "event_is_full"


class UserNotEventHostError(BaseDomainError):
    """Пользователь не является организатором мероприятия."""
    CODE = "user_not_event_host"


class EventAlreadyCancelledError(BaseDomainError):
    """Мероприятие уже отменено."""
    CODE = "event_already_cancelled"


class EventAlreadyCompletedError(BaseDomainError):
    """Мероприятие уже завершено."""
    CODE = "event_already_completed"


class MaxParticipantsBelowCurrentError(BaseDomainError):
    """Новый лимит участников меньше текущего количества."""
    CODE = "max_participants_below_current"


class InvalidChatTypeError(BaseDomainError):
    """Недопустимый тип чата для события. Разрешены только GROUP и CHANNEL."""
    CODE = "invalid_chat_type"

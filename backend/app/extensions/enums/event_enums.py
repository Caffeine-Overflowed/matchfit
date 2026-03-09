from enum import Enum, unique

@unique
class EventPrivacy(str, Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    FRIENDS_ONLY = "FRIENDS_ONLY"

@unique
class EventCategory(str, Enum):
    TRIP = "TRIP"
    SPORT = "SPORT"
    LECTURE = "LECTURE"
    WORKSHOP = "WORKSHOP"

@unique
class EventStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

@unique
class DifficultyLevel(str, Enum):
    N_A = "N_A"
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


@unique
class ParticipantRole(str, Enum):
    HOST = "HOST"
    MEMBER = "MEMBER"


@unique
class ParticipantStatus(str, Enum):
    ACTIVE = "ACTIVE"
    LEFT = "LEFT"
    REMOVED = "REMOVED"
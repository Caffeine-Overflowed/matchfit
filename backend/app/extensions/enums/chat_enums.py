from enum import Enum
import strawberry


class ChatKind(str, Enum):
    """Chat type enumeration."""

    DIRECT = "DIRECT"
    CHANNEL = "CHANNEL"
    GROUP = "GROUP"

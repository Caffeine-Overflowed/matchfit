from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True, slots=True)
class ClientInfo:
    ip: str
    user_agent: Optional[str]
    locale: Optional[str]


@dataclass(frozen=True, slots=True)
class AuthContext:
    user_id: str
    session_id: str

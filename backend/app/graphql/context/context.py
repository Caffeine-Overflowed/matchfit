from dataclasses import dataclass
from typing import Optional

from strawberry.fastapi import BaseContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.request_state_models import AuthContext, ClientInfo
from app.graphql.dataloaders import (
    ProfileLoader,
    EventParticipationLoader,
    EventParticipantsCountLoader,
    LastMessageLoader,
    UnreadCountLoader,
    ReadStateLoader,
    OtherUserLoader,
)


@dataclass
class GQLContext(BaseContext):
    request_id: str
    client_info: ClientInfo
    profile_loader: ProfileLoader
    event_participation_loader: EventParticipationLoader
    event_participants_count_loader: EventParticipantsCountLoader
    last_message_loader: LastMessageLoader
    unread_count_loader: UnreadCountLoader
    read_state_loader: ReadStateLoader
    other_user_loader: OtherUserLoader
    auth_context: Optional[AuthContext] = None

    @property
    def is_authenticated(self) -> bool:
        return self.auth_context is not None

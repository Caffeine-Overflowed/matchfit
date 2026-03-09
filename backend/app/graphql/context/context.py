from dataclasses import dataclass
from typing import Optional

from strawberry.fastapi import BaseContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.request_state_models import AuthContext, ClientInfo
from app.graphql.dataloaders import ProfileLoader, EventParticipationLoader, EventParticipantsCountLoader


@dataclass
class GQLContext(BaseContext):
    request_id: str
    client_info: ClientInfo
    profile_loader: ProfileLoader
    event_participation_loader: EventParticipationLoader
    event_participants_count_loader: EventParticipantsCountLoader
    auth_context: Optional[AuthContext] = None

    @property
    def is_authenticated(self) -> bool:
        return self.auth_context is not None

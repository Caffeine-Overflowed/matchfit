from fastapi import Request

from app.graphql.context.context import GQLContext
from app.graphql.dataloaders import (
    ProfileLoader,
    EventParticipationLoader,
    EventParticipantsCountLoader,
    LastMessageLoader,
    UnreadCountLoader,
    ReadStateLoader,
    OtherUserLoader,
)


async def get_context(
    request: Request,
) -> GQLContext:
    return GQLContext(
        request_id=request.state.request_id,
        client_info=request.state.client_info,
        profile_loader=ProfileLoader(),
        event_participation_loader=EventParticipationLoader(),
        event_participants_count_loader=EventParticipantsCountLoader(),
        last_message_loader=LastMessageLoader(),
        unread_count_loader=UnreadCountLoader(),
        read_state_loader=ReadStateLoader(),
        other_user_loader=OtherUserLoader(),
        auth_context=request.state.auth_context,
    )

import uuid

from starlette.requests import HTTPConnection

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
from app.utils.client_info import build_client_info


async def get_context(
    connection: HTTPConnection,
) -> GQLContext:
    is_websocket = connection.scope["type"] == "websocket"

    if is_websocket:
        request_id = str(uuid.uuid4())
        client_info = build_client_info(connection)
        auth_context = None
    else:
        request_id = connection.state.request_id
        client_info = connection.state.client_info
        auth_context = connection.state.auth_context

    return GQLContext(
        request_id=request_id,
        client_info=client_info,
        profile_loader=ProfileLoader(),
        event_participation_loader=EventParticipationLoader(),
        event_participants_count_loader=EventParticipantsCountLoader(),
        last_message_loader=LastMessageLoader(),
        unread_count_loader=UnreadCountLoader(),
        read_state_loader=ReadStateLoader(),
        other_user_loader=OtherUserLoader(),
        auth_context=auth_context,
    )

from fastapi import Request

from app.graphql.context.context import GQLContext
from app.graphql.dataloaders import ProfileLoader, EventParticipationLoader, EventParticipantsCountLoader


async def get_context(
    request: Request,
) -> GQLContext:
    return GQLContext(
        request_id=request.state.request_id,
        client_info=request.state.client_info,
        profile_loader=ProfileLoader(),
        event_participation_loader=EventParticipationLoader(),
        event_participants_count_loader=EventParticipantsCountLoader(),
        auth_context=request.state.auth_context,
    )

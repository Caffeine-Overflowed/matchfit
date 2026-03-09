import strawberry
from typing import List
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.inputs.event_inputs import GetEventsInput, GetMyEventsInput
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.event_type import EventType, EventConnection, NearbyEventType
from app.services.event_service import EventService
from app.utils.database import Database


@strawberry.type
class EventQueries:
    @strawberry.field(
        description="Получить список событий с фильтрами",
        permission_classes=[IsAuthenticated],
    )
    async def events(
        self,
        info: Info[GQLContext, None],
        params: GetEventsInput,
    ) -> EventConnection:
        async with Database.get_session() as session:
            events, total_count, has_more = await EventService.get_events(
                session,
                user_id=info.context.auth_context.user_id,
                radius_km=params.radius_km,
                limit=params.limit,
                offset=params.offset,
                categories=params.categories,
                statuses=params.statuses,
                difficulties=params.difficulties,
                host_id=params.host_id,
                sport_ids=params.sport_ids,
                search=params.search,
                from_date=params.from_date,
                to_date=params.to_date,
                privacy=params.privacy,
            )

        return EventConnection(
            items=[EventType.from_model(e, map_chat=False) for e in events],
            total_count=total_count,
            has_more=has_more,
        )

    @strawberry.field(
        description="Получить событие по ID",
        permission_classes=[IsAuthenticated],
    )
    async def event(
        self,
        info: Info[GQLContext, None],
        event_id: str,
    ) -> EventType:
        async with Database.get_session() as session:
            event = await EventService.get_event_by_id(session, event_id)

        return EventType.from_model(event)

    @strawberry.field(
        description="Получить мои события (где я организатор или участник)",
        permission_classes=[IsAuthenticated],
    )
    async def my_events(
        self,
        info: Info[GQLContext, None],
        params: GetMyEventsInput,
    ) -> EventConnection:
        async with Database.get_session() as session:
            events, total_count, has_more = await EventService.get_my_events(
                session,
                user_id=info.context.auth_context.user_id,
                limit=params.limit,
                offset=params.offset,
                statuses=params.statuses,
            )

        return EventConnection(
            items=[EventType.from_model(e, map_chat=False) for e in events],
            total_count=total_count,
            has_more=has_more,
        )

    @strawberry.field(
        description="Получить ближайшие события с сортировкой по расстоянию (до 20 штук, макс. 200 км)",
        permission_classes=[IsAuthenticated],
    )
    async def nearby_events(
        self,
        info: Info[GQLContext, None],
        limit: int = 10,
    ) -> List[NearbyEventType]:
        async with Database.get_session() as session:
            results = await EventService.get_nearby_events(
                session,
                user_id=info.context.auth_context.user_id,
                limit=limit,
            )

        return [NearbyEventType.from_tuple(event, dist) for event, dist in results]

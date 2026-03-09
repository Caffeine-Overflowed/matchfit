import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.inputs.event_inputs import CreateEventInput, UpdateEventInput
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.event_type import EventType
from app.services.event_service import EventService
from app.utils.database import Database


@strawberry.type
class EventMutations:

    @strawberry.mutation(
        description="Создание нового события",
        permission_classes=[IsAuthenticated],
    )
    async def create_event(
        self, info: Info[GQLContext, None], event_data: CreateEventInput
    ) -> EventType:
        async with Database.get_session() as session:
            event = await EventService.create_event(
                session=session,
                host_id=info.context.auth_context.user_id,
                event_data=event_data,
            )
            return EventType.from_model(event)

    @strawberry.mutation(
        description="Присоединиться к событию",
        permission_classes=[IsAuthenticated],
    )
    async def join_event(
        self, info: Info[GQLContext, None], event_id: str
    ) -> EventType:
        async with Database.get_session() as session:
            event = await EventService.join_event(
                session=session,
                user_id=info.context.auth_context.user_id,
                event_id=event_id,
            )
            return EventType.from_model(event)

    @strawberry.mutation(
        description="Обновить событие (только организатор)",
        permission_classes=[IsAuthenticated],
    )
    async def update_event(
        self, info: Info[GQLContext, None], event_data: UpdateEventInput
    ) -> EventType:
        async with Database.get_session() as session:
            event = await EventService.update_event(
                session=session,
                user_id=info.context.auth_context.user_id,
                event_data=event_data,
            )
            return EventType.from_model(event)

    @strawberry.mutation(
        description="Отменить событие (только организатор)",
        permission_classes=[IsAuthenticated],
    )
    async def cancel_event(
        self, info: Info[GQLContext, None], event_id: str
    ) -> EventType:
        async with Database.get_session() as session:
            event = await EventService.cancel_event(
                session=session,
                user_id=info.context.auth_context.user_id,
                event_id=event_id,
            )
            return EventType.from_model(event)

from __future__ import annotations

import strawberry
from typing import Optional, List, TYPE_CHECKING, Annotated
from datetime import datetime
from strawberry.types import Info

from app.extensions.enums.event_enums import (
    EventPrivacy, DifficultyLevel, EventCategory, EventStatus
)
from app.models import Chat
from app.utils.database import Database
from app.utils.geo import extract_coords
from app.services.profile_service import ProfileService

from app.utils.minio import MinioService, MinioFolder
if TYPE_CHECKING:
    from app.models.event import Event
    from app.graphql.context.context import GQLContext
    from app.graphql.types.chat import ChatInfoType


@strawberry.type(description="Краткая информация об организаторе события")
class EventHostType:
    id: str = strawberry.field(description="UUID пользователя")
    name: Optional[str] = strawberry.field(description="Имя пользователя")
    avatar_url: Optional[str] = strawberry.field(description="URL аватара")


@strawberry.type(description="Событие")
class EventType:
    id: str = strawberry.field(description="UUID события")
    host_id: str = strawberry.field(description="UUID организатора")
    title: str = strawberry.field(description="Название события")
    description: Optional[str] = strawberry.field(description="Описание события")
    category: EventCategory = strawberry.field(description="Категория события")
    image_file_name: str = strawberry.field(description="URL изображения события")
    start_time: datetime = strawberry.field(description="Время начала")
    end_time: Optional[datetime] = strawberry.field(description="Время окончания")
    lat: float = strawberry.field(description="Широта")
    lon: float = strawberry.field(description="Долгота")
    status: EventStatus = strawberry.field(description="Статус события")
    target_participants: Optional[int] = strawberry.field(description="Желаемое количество участников")
    max_participants: Optional[int] = strawberry.field(description="Максимальное количество участников")
    privacy: EventPrivacy = strawberry.field(description="Приватность события")
    difficulty: DifficultyLevel = strawberry.field(description="Уровень сложности")
    sport_ids: List[int] = strawberry.field(description="ID видов спорта")
    created_at: datetime = strawberry.field(description="Дата создания")
    chat_id : Optional[str] = strawberry.field(description="UUID чата события")

    chat: Annotated["ChatInfoType", strawberry.lazy(".chat")] | None = strawberry.field(
        default=None,
        description="Информация о чате события"
    )

    @strawberry.field(description="Информация о чате события")
    async def chat(self) -> Annotated["ChatInfoType", strawberry.lazy(".chat")] | None:
        async with Database.get_session() as session:
            chat = await session.get(Chat, self.chat_id)
            return ChatInfoType(
                id=chat.id,
                image_file_name=MinioService.form_link(MinioFolder.CHAT_AVATARS, chat.image_file_name),
                type=chat.type,
                title=chat.title,
                is_deleted=chat.is_deleted,
            )

    @classmethod
    def from_model(cls, event: Event) -> "EventType":
        """Маппинг Event модели в GraphQL тип."""
        from app.graphql.types.chat import ChatInfoType

        coords = extract_coords(event.location)
        lat, lon = coords if coords else (0.0, 0.0)
        chat: Chat = event.chat
        return cls(
            id=event.id,
            host_id=event.host_id,
            title=event.title,
            description=event.description,
            category=event.category,
            image_file_name=MinioService.form_link(MinioFolder.EVENT_IMAGES, event.image_file_name),
            start_time=event.start_time,
            end_time=event.end_time,
            lat=lat,
            lon=lon,
            chat_id=event.chat_id,
            status=event.status,
            target_participants=event.target_participants,
            max_participants=event.max_participants,
            privacy=event.privacy,
            difficulty=event.difficulty,
            sport_ids=[s.id for s in event.sports],
            created_at=event.created_at,
            chat=ChatInfoType(
                id=chat.id,
                image_file_name=MinioService.form_link(MinioFolder.CHAT_AVATARS, chat.image_file_name),
                type=chat.type,
                title=chat.title,
                is_deleted=chat.is_deleted,
            ) if map_chat and chat else None,
        )

    @strawberry.field(description="Является ли текущий пользователь организатором события")
    def is_host(self, info: Info[GQLContext, None]) -> bool:
        return info.context.auth_context.user_id == self.host_id

    @strawberry.field(description="Является ли текущий пользователь участником события")
    async def is_participant(self, info: Info[GQLContext, None]) -> bool:
        user_id = info.context.auth_context.user_id
        is_participant = await info.context.event_participation_loader.load(
            (self.id, user_id)
        )
        return is_participant

    @strawberry.field(description="Количество участников события")
    async def participants_count(self, info: Info[GQLContext, None]) -> int:
        return await info.context.event_participants_count_loader.load(self.id)

    @strawberry.field(description="Информация об организаторе")
    async def host(self, info: Info[GQLContext, None]) -> Optional[EventHostType]:
        profile = await info.context.profile_loader.load(self.host_id)

        if not profile:
            return EventHostType(id=self.host_id, name=None, avatar_url=None)

        return EventHostType(
            id=self.host_id,
            name=profile.name,
            avatar_url=ProfileService.get_avatar_url(profile),
        )


@strawberry.type(description="Пагинированный список событий")
class EventConnection:
    items: List[EventType] = strawberry.field(description="Список событий")
    total_count: int = strawberry.field(description="Общее количество")
    has_more: bool = strawberry.field(description="Есть ли ещё события")


@strawberry.type(description="Ближайшее событие с расстоянием")
class NearbyEventType:
    event: EventType = strawberry.field(description="Событие")
    distance_km: float = strawberry.field(description="Расстояние до события в км")

    @classmethod
    def from_tuple(cls, event: Event, distance_km: float) -> NearbyEventType:
        """Создание из кортежа (Event, distance_km)."""
        return cls(
            event=EventType.from_model(event),
            distance_km=round(distance_km, 2),
        )

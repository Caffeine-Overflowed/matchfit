import strawberry
from strawberry.file_uploads import Upload
from typing import Optional, List
from datetime import datetime
from app.extensions.enums.chat_enums import ChatKind
from app.extensions.enums.event_enums import (
    EventPrivacy, DifficultyLevel, EventCategory, EventStatus
)


@strawberry.input(description="Данные для создания события")
class CreateEventInput:
    title: str = strawberry.field(description="Название события")
    start_time: datetime = strawberry.field(description="Время начала (UTC)")
    lat: float = strawberry.field(description="Широта")
    lon: float = strawberry.field(description="Долгота")
    chat_type: ChatKind = strawberry.field(description="Тип чата события (GROUP или CHANNEL)")

    image_file_name: Upload = strawberry.field(description="Файл изображения события (image)")
    category: EventCategory = strawberry.field(
        default=EventCategory.TRIP,
        description="Категория события"
    )
    description: Optional[str] = strawberry.field(
        default=None,
        description="Описание события"
    )
    end_time: Optional[datetime] = strawberry.field(
        default=None,
        description="Время окончания (UTC)"
    )
    max_participants: Optional[int] = strawberry.field(
        default=None,
        description="Максимальное количество участников"
    )
    target_participants: Optional[int] = strawberry.field(
        default=None,
        description="Желаемое количество участников"
    )
    privacy: EventPrivacy = strawberry.field(
        default=EventPrivacy.PUBLIC,
        description="Приватность события"
    )
    difficulty: DifficultyLevel = strawberry.field(
        default=DifficultyLevel.N_A,
        description="Уровень сложности"
    )
    sport_ids: List[int] = strawberry.field(
        default_factory=list,
        description="ID видов спорта"
    )


@strawberry.input(description="Фильтры для списка событий")
class GetEventsInput:
    radius_km: float = strawberry.field(description="Радиус поиска в километрах (обязательный)")
    limit: int = strawberry.field(default=20, description="Количество записей")
    offset: int = strawberry.field(default=0, description="Смещение")

    search: str = strawberry.field(
        default="", description="Поиск по названию (пустая строка = без фильтра)"
    )
    categories: List[EventCategory] = strawberry.field(
        default_factory=list, description="Фильтр по категориям (пусто = все)"
    )
    difficulties: List[DifficultyLevel] = strawberry.field(
        default_factory=list, description="Фильтр по сложности (пусто = все)"
    )
    sport_ids: List[int] = strawberry.field(
        default_factory=list, description="Фильтр по видам спорта (пусто = все)"
    )
    from_date: Optional[datetime] = strawberry.field(
        default=None, description="События начиная с даты"
    )
    to_date: Optional[datetime] = strawberry.field(
        default=None, description="События до даты"
    )
    statuses: List[EventStatus] = strawberry.field(
        default_factory=list,
        description="Фильтр по статусам (пусто = все для своих, SCHEDULED для чужих)"
    )
    host_id: Optional[str] = strawberry.field(
        default=None, description="Фильтр по организатору (для 'мои события')"
    )
    privacy: Optional[EventPrivacy] = strawberry.field(
        default=None, description="Фильтр по приватности (None = PUBLIC + FRIENDS_ONLY от друзей)"
    )


@strawberry.input(description="Фильтры для списка моих событий")
class GetMyEventsInput:
    limit: int = strawberry.field(default=20, description="Количество записей")
    offset: int = strawberry.field(default=0, description="Смещение")
    statuses: List[EventStatus] = strawberry.field(
        default_factory=list,
        description="Фильтр по статусам (пусто = все)"
    )


@strawberry.input(description="Данные для полного обновления события")
class UpdateEventInput:
    event_id: str = strawberry.field(description="ID события")
    title: str = strawberry.field(description="Название события")
    start_time: datetime = strawberry.field(description="Время начала (UTC)")
    lat: float = strawberry.field(description="Широта")
    lon: float = strawberry.field(description="Долгота")
    chat_type: ChatKind = strawberry.field(description="Тип чата события (GROUP или CHANNEL)")
    image_file: Upload = strawberry.field(description="Файл изображения события (image)")
    category: EventCategory = strawberry.field(
        default=EventCategory.TRIP,
        description="Категория события"
    )
    description: Optional[str] = strawberry.field(
        default=None,
        description="Описание события"
    )
    end_time: Optional[datetime] = strawberry.field(
        default=None,
        description="Время окончания (UTC)"
    )
    max_participants: Optional[int] = strawberry.field(
        default=None,
        description="Максимальное количество участников"
    )
    target_participants: Optional[int] = strawberry.field(
        default=None,
        description="Желаемое количество участников"
    )
    privacy: EventPrivacy = strawberry.field(
        default=EventPrivacy.PUBLIC,
        description="Приватность события"
    )
    difficulty: DifficultyLevel = strawberry.field(
        default=DifficultyLevel.N_A,
        description="Уровень сложности"
    )
    sport_ids: List[int] = strawberry.field(
        default_factory=list,
        description="ID видов спорта"
    )

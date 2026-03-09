from datetime import datetime
from typing import Optional, Sequence, Any

from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.event import Event, event_sports
from app.models.event_participant import EventParticipant
from app.extensions.enums.event_enums import (
    EventCategory, EventStatus, DifficultyLevel, EventPrivacy, ParticipantStatus
)


def _escape_like(value: str) -> str:
    """Экранирует специальные символы LIKE (%, _, \\)."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

class EventRepository:

    @staticmethod
    async def create(session: AsyncSession, event: Event) -> Event:
        """Создание события в БД."""
        session.add(event)
        await session.flush()
        await session.refresh(event, attribute_names=["location", "chat"])
        return event

    @staticmethod
    async def get_by_id(
        session: AsyncSession,
        event_id: str,
        load_sports: bool = True,
    ) -> Optional[Event]:
        """Получение события по ID."""
        query = select(Event).where(Event.id == event_id)
        if load_sports:
            query = query.options(selectinload(Event.sports)).options(selectinload(Event.chat))
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    def _apply_filters(
        query,
        user_location: Any,
        radius_km: float,
        categories: Sequence[EventCategory] | None = None,
        statuses: Sequence[EventStatus] | None = None,
        difficulties: Sequence[DifficultyLevel] | None = None,
        host_id: Optional[str] = None,
        sport_ids: Sequence[int] | None = None,
        search: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        privacy: Optional[EventPrivacy] = None,
        friends_ids: Sequence[str] | None = None,
    ):
        """Применяет общие фильтры к query."""
        # Гео-фильтрация по радиусу от локации пользователя (в метрах)
        radius_meters = radius_km * 1000
        query = query.where(
            func.ST_DWithin(Event.location, user_location, radius_meters)
        )

        if categories:
            query = query.where(Event.category.in_(categories))
        if statuses:
            query = query.where(Event.status.in_(statuses))
        if difficulties:
            query = query.where(Event.difficulty.in_(difficulties))
        if host_id:
            query = query.where(Event.host_id == host_id)
        if sport_ids:
            query = query.join(event_sports).where(event_sports.c.sport_id.in_(sport_ids))
        if search:
            escaped = _escape_like(search)
            query = query.where(Event.title.ilike(f"%{escaped}%", escape="\\"))
        if from_date:
            query = query.where(Event.start_time >= from_date)
        if to_date:
            query = query.where(Event.start_time <= to_date)
        
        # Privacy filtering logic:
        # - None (default): PUBLIC + FRIENDS_ONLY от друзей
        # - PUBLIC: только публичные
        # - FRIENDS_ONLY: только от друзей
        if privacy is None:
            if friends_ids:
                query = query.where(
                    or_(
                        Event.privacy == EventPrivacy.PUBLIC,
                        and_(
                            Event.privacy == EventPrivacy.FRIENDS_ONLY,
                            Event.host_id.in_(friends_ids)
                        )
                    )
                )
            else:
                query = query.where(Event.privacy == EventPrivacy.PUBLIC)
        elif privacy == EventPrivacy.PUBLIC:
            query = query.where(Event.privacy == EventPrivacy.PUBLIC)
        elif privacy == EventPrivacy.FRIENDS_ONLY:
            if friends_ids:
                query = query.where(
                    and_(
                        Event.privacy == EventPrivacy.FRIENDS_ONLY,
                        Event.host_id.in_(friends_ids)
                    )
                )
            else:
                query = query.where(Event.id == None)  # Always false
        
        return query

    @staticmethod
    async def get_list(
        session: AsyncSession,
        user_location: Any,
        radius_km: float,
        limit: int = 20,
        offset: int = 0,
        categories: Sequence[EventCategory] | None = None,
        statuses: Sequence[EventStatus] | None = None,
        difficulties: Sequence[DifficultyLevel] | None = None,
        host_id: Optional[str] = None,
        sport_ids: Sequence[int] | None = None,
        search: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        privacy: Optional[EventPrivacy] = None,
        friends_ids: Sequence[str] | None = None,
    ) -> list[Event]:
        """Получение списка событий с фильтрами."""
        query = select(Event).options(selectinload(Event.sports))
        
        query = EventRepository._apply_filters(
            query,
            user_location=user_location,
            radius_km=radius_km,
            categories=categories,
            statuses=statuses,
            difficulties=difficulties,
            host_id=host_id,
            sport_ids=sport_ids,
            search=search,
            from_date=from_date,
            to_date=to_date,
            privacy=privacy,
            friends_ids=friends_ids,
        )

        # Для get_list добавляем distinct (из-за join с sports)
        query = query.distinct()
        query = query.order_by(Event.start_time.asc())
        query = query.offset(offset).limit(limit)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def count(
        session: AsyncSession,
        user_location: Any,
        radius_km: float,
        categories: Sequence[EventCategory] | None = None,
        statuses: Sequence[EventStatus] | None = None,
        difficulties: Sequence[DifficultyLevel] | None = None,
        host_id: Optional[str] = None,
        sport_ids: Sequence[int] | None = None,
        search: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        privacy: Optional[EventPrivacy] = None,
        friends_ids: Sequence[str] | None = None,
    ) -> int:
        """Подсчёт событий с фильтрами."""
        query = select(func.count(func.distinct(Event.id))).select_from(Event)
        
        query = EventRepository._apply_filters(
            query,
            user_location=user_location,
            radius_km=radius_km,
            categories=categories,
            statuses=statuses,
            difficulties=difficulties,
            host_id=host_id,
            sport_ids=sport_ids,
            search=search,
            from_date=from_date,
            to_date=to_date,
            privacy=privacy,
            friends_ids=friends_ids,
        )

        result = await session.execute(query)
        return result.scalar() or 0

    @staticmethod
    async def get_nearby(
        session: AsyncSession,
        user_location: Any,
        limit: int = 10,
        max_radius_km: float = 200.0,
        friends_ids: Sequence[str] | None = None,
    ) -> list[tuple[Event, float]]:
        """
        Получение ближайших событий с сортировкой по расстоянию, затем по времени.
        Возвращает список кортежей (Event, distance_km).
        """
        # Максимум 20 результатов
        limit = min(limit, 20)
        max_radius_meters = max_radius_km * 1000

        # Вычисляем расстояние
        distance_expr = func.ST_Distance(Event.location, user_location)

        query = (
            select(Event, distance_expr.label("distance"))
            .options(selectinload(Event.sports))
            .where(func.ST_DWithin(Event.location, user_location, max_radius_meters))
        )

        # Privacy filter: PUBLIC + FRIENDS_ONLY от друзей
        if friends_ids:
            query = query.where(
                or_(
                    Event.privacy == EventPrivacy.PUBLIC,
                    and_(
                        Event.privacy == EventPrivacy.FRIENDS_ONLY,
                        Event.host_id.in_(friends_ids)
                    )
                )
            )
        else:
            query = query.where(Event.privacy == EventPrivacy.PUBLIC)

        # Сортировка: по расстоянию, затем по времени
        query = query.order_by(distance_expr.asc(), Event.start_time.asc())
        query = query.limit(limit)

        result = await session.execute(query)
        rows = result.all()
        
        # Конвертируем расстояние в км
        return [(row.Event, row.distance / 1000 if row.distance else 0) for row in rows]

    @staticmethod
    async def get_by_id_with_sports(session: AsyncSession, event_id: str) -> Optional[Event]:
        """Получение события по ID с загруженными sports."""
        result = await session.execute(
            select(Event)
            .where(Event.id == event_id)
            .options(selectinload(Event.sports))

        )
        return result.scalar_one_or_none()

    @staticmethod
    async def is_participant(session: AsyncSession, event_id: str, user_id: str) -> bool:
        """Проверка, является ли пользователь участником события."""
        result = await session.execute(
            select(EventParticipant).where(
                EventParticipant.event_id == event_id,
                EventParticipant.user_id == user_id,
                EventParticipant.status == ParticipantStatus.ACTIVE
            )
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def count_participants(session: AsyncSession, event_id: str) -> int:
        """Подсчет количества активных участников."""
        result = await session.execute(
            select(func.count(EventParticipant.event_id)).where(
                EventParticipant.event_id == event_id,
                EventParticipant.status == ParticipantStatus.ACTIVE
            )
        )
        return result.scalar() or 0

    @staticmethod
    async def add_participant(
        session: AsyncSession,
        participant: "EventParticipant",
        event: Event,
    ) -> Event:
        """Добавление участника к событию."""
        session.add(participant)
        await session.flush()
        await session.refresh(event)
        return event

    @staticmethod
    async def update(session: AsyncSession, event: Event) -> Event:
        """Обновление события в БД."""
        await session.flush()
        await session.refresh(event)
        return event

    @staticmethod
    async def get_active_participant_ids(session: AsyncSession, event_id: str) -> list[str]:
        """Получение ID всех активных участников события."""
        result = await session.execute(
            select(EventParticipant.user_id).where(
                EventParticipant.event_id == event_id,
                EventParticipant.status == ParticipantStatus.ACTIVE
            )
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_user_events(
        session: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        statuses: Sequence[EventStatus] | None = None,
    ) -> list[Event]:
        """Получение событий где пользователь host или активный участник."""
        # Подзапрос: ID событий где юзер — активный участник
        participant_event_ids = (
            select(EventParticipant.event_id)
            .where(
                EventParticipant.user_id == user_id,
                EventParticipant.status == ParticipantStatus.ACTIVE
            )
            .scalar_subquery()
        )

        query = (
            select(Event)
            .options(selectinload(Event.sports))
            .where(
                (Event.host_id == user_id) | (Event.id.in_(participant_event_ids))
            )
        )

        if statuses:
            query = query.where(Event.status.in_(statuses))

        query = query.order_by(Event.start_time.asc())
        query = query.offset(offset).limit(limit)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def count_user_events(
        session: AsyncSession,
        user_id: str,
        statuses: Sequence[EventStatus] | None = None,
    ) -> int:
        """Подсчёт событий где пользователь host или активный участник."""
        participant_event_ids = (
            select(EventParticipant.event_id)
            .where(
                EventParticipant.user_id == user_id,
                EventParticipant.status == ParticipantStatus.ACTIVE
            )
            .scalar_subquery()
        )

        query = (
            select(func.count(Event.id))
            .where(
                (Event.host_id == user_id) | (Event.id.in_(participant_event_ids))
            )
        )

        if statuses:
            query = query.where(Event.status.in_(statuses))

        result = await session.execute(query)
        return result.scalar() or 0

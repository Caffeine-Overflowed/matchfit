from datetime import datetime, UTC
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.repositories.event_repository import EventRepository
from app.repositories.sport_repository import SportRepository
from app.repositories.chat_repository import ChatRepository
from app.repositories.chat_participation_repository import ChatParticipationRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.match_repository import MatchRepository
from app.extensions.enums.event_enums import (
    EventStatus, EventCategory, DifficultyLevel, EventPrivacy,
    ParticipantRole, ParticipantStatus
)
from app.extensions.enums.chat_enums import ChatKind
from app.extensions.errors.event import (
    EventStartTimeInPastError, EventEndTimeBeforeStartError, EventNotFoundError,
    UserAlreadyParticipantError, EventIsFullError, UserNotEventHostError,
    EventAlreadyCancelledError, EventAlreadyCompletedError, MaxParticipantsBelowCurrentError,
    InvalidChatTypeError
)
from app.extensions.enums.notification_enums import NotificationType
from app.graphql.inputs.event_inputs import CreateEventInput, UpdateEventInput
from app.services.notification_service import NotificationService
from app.services.avatar_service import AvatarService
from app.utils.geo import make_point, extract_coords
from app.utils.observability import get_logger
from app.repositories.profile_repository import ProfileRepository
from app.utils.minio import MinioService, MinioFolder

log = get_logger()


class EventService:

    @classmethod
    async def create_event(
        cls,
        session: AsyncSession,
        host_id: str,
        event_data: CreateEventInput
    ) -> Event:
        """Создание нового события."""
        now = datetime.now(UTC)
        start_time = event_data.start_time

        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=UTC)

        if start_time < now:
            raise EventStartTimeInPastError()

        end_time = event_data.end_time
        if end_time:
            if end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=UTC)

            if end_time <= start_time:
                raise EventEndTimeBeforeStartError()

        # Validate chat type - only GROUP or CHANNEL allowed
        if event_data.chat_type == ChatKind.DIRECT:
            raise InvalidChatTypeError()

        sports = await SportRepository.get_by_ids(session, event_data.sport_ids)

        # Upload event avatar to Minio
        content = await event_data.image_file_name.read()
        image_file_name = MinioService.form_avatar_name(event_data.image_file_name, host_id)

        await MinioService.upload_object(
            folder=MinioFolder.AVATARS,
            object_name=image_file_name,
            file=content
        )

        # Generate avatar for chat
        avatar_filename = await AvatarService.generate_chat_avatar(event_data.title)

        # Create chat for the event
        chat = await ChatRepository.create(
            session=session,
            chat_type=event_data.chat_type,
            title=event_data.title,
            image_file_name=avatar_filename,
        )

        # Add host to chat as participant
        await ChatParticipationRepository.add_participant(
            session=session,
            chat_id=chat.id,
            user_id=host_id,
            is_host=True,
        )

        # Send system message
        system_message = (
            "Channel created" if event_data.chat_type == ChatKind.CHANNEL else "Group created"
        )
        await MessageRepository.create_system_message(
            session=session,
            chat_id=chat.id,
            sender_id=host_id,
            content=system_message,
        )

        new_event = Event(
            host_id=host_id,
            title=event_data.title,
            description=event_data.description,
            category=event_data.category,
            image_file_name=image_file_name,
            start_time=start_time,
            end_time=end_time,
            location=make_point(event_data.lat, event_data.lon),
            target_participants=event_data.target_participants,
            max_participants=event_data.max_participants,
            privacy=event_data.privacy,
            difficulty=event_data.difficulty,
            status=EventStatus.SCHEDULED,
            sports=sports,
            chat_id=chat.id,
        )

        # Automatically add host as a participant
        participant = EventParticipant(
            user_id=host_id,
            role=ParticipantRole.HOST,
            status=ParticipantStatus.ACTIVE,
            joined_at=now
        )
        new_event.participants.append(participant)

        event = await EventRepository.create(session, new_event)

        log.info("event.created", event_id=event.id, host_id=host_id, chat_id=chat.id)
        return event

    @classmethod
    async def get_event_by_id(
        cls,
        session: AsyncSession,
        event_id: str,
    ) -> Event:
        """Получение события по ID."""
        event = await EventRepository.get_by_id(session, event_id)
        if not event:
            raise EventNotFoundError()
        return event

    @classmethod
    async def get_events(
        cls,
        session: AsyncSession,
        user_id: str,
        radius_km: float,
        limit: int = 20,
        offset: int = 0,
        categories: Sequence[EventCategory] | None = None,
        statuses: Sequence[EventStatus] | None = None,
        difficulties: Sequence[DifficultyLevel] | None = None,
        host_id: str | None = None,
        sport_ids: Sequence[int] | None = None,
        search: str | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        privacy: EventPrivacy | None = None,
    ) -> tuple[list[Event], int, bool]:
        """
        Получение списка событий с фильтрами.
        Возвращает (events, total_count, has_more).
        """
        # Получаем локацию пользователя
        profile = await ProfileRepository.get_by_user_id(session, user_id)
        if not profile or not profile.location:
            return [], 0, False

        user_location = profile.location

        # Бизнес-логика: для чужих событий — только SCHEDULED
        effective_statuses = statuses
        if not host_id:
            effective_statuses = [EventStatus.SCHEDULED]

        # Получаем список друзей (сматченных пользователей)
        # Они могут видеть FRIENDS_ONLY события
        friends_ids = await MatchRepository.get_matched_user_ids(session, user_id)

        # Clamp limit
        limit = min(max(limit, 1), 100)

        events = await EventRepository.get_list(
            session,
            user_location=user_location,
            radius_km=radius_km,
            limit=limit + 1,
            offset=offset,
            categories=categories or None,
            statuses=effective_statuses or None,
            difficulties=difficulties or None,
            host_id=host_id,
            sport_ids=sport_ids or None,
            search=search or None,
            from_date=from_date,
            to_date=to_date,
            privacy=privacy,
            friends_ids=friends_ids,
        )

        has_more = len(events) > limit
        if has_more:
            events = events[:limit]

        total_count = await EventRepository.count(
            session,
            user_location=user_location,
            radius_km=radius_km,
            categories=categories or None,
            statuses=effective_statuses or None,
            difficulties=difficulties or None,
            host_id=host_id,
            sport_ids=sport_ids or None,
            search=search or None,
            from_date=from_date,
            to_date=to_date,
            privacy=privacy,
            friends_ids=friends_ids,
        )

        return events, total_count, has_more

    @classmethod
    async def get_nearby_events(
        cls,
        session: AsyncSession,
        user_id: str,
        limit: int = 20,
    ) -> list[tuple[Event, float]]:
        """
        Получение ближайших событий с сортировкой по расстоянию.
        Возвращает список кортежей (Event, distance_km).
        """
        # Получаем профиль пользователя для локации
        profile = await ProfileRepository.get_by_user_id(session, user_id)
        if not profile or not profile.location:
            return []

        # Получаем список друзей для FRIENDS_ONLY событий
        friends_ids = await MatchRepository.get_matched_user_ids(session, user_id)

        return await EventRepository.get_nearby(
            session=session,
            user_location=profile.location,
            limit=limit,
            max_radius_km=200.0,
            friends_ids=friends_ids if friends_ids else None,
        )

    @classmethod
    async def join_event(
        cls,
        session: AsyncSession,
        user_id: str,
        event_id: str
    ) -> Event:
        """
        Добавление пользователя к событию.
        """
        event = await EventRepository.get_by_id(session, event_id)
        if not event:
            raise EventNotFoundError()

        if event.status == EventStatus.CANCELLED:
            raise EventAlreadyCancelledError()

        if await EventRepository.is_participant(session, event_id, user_id):
            raise UserAlreadyParticipantError()

        if event.max_participants:
            current_count = await EventRepository.count_participants(session, event_id)
            if current_count >= event.max_participants:
                raise EventIsFullError()

        participant = EventParticipant(
            user_id=user_id,
            event_id=event_id,
            role=ParticipantRole.MEMBER,
            status=ParticipantStatus.ACTIVE,
            joined_at=datetime.now(UTC)
        )

        event = await EventRepository.add_participant(session, participant, event)
        await ChatParticipationRepository.add_participant(
            session=session,
            chat_id=event.chat_id,
            user_id=user_id,
            is_host=False,
        )
        log.info("event.joined", event_id=event_id, user_id=user_id)
        return event

    @classmethod
    async def update_event(
        cls,
        session: AsyncSession,
        user_id: str,
        event_data: UpdateEventInput
    ) -> Event:
        """Обновление события организатором."""
        event = await EventRepository.get_by_id(session, event_data.event_id)
        if not event:
            raise EventNotFoundError()

        if event.host_id != user_id:
            raise UserNotEventHostError()

        if event.status == EventStatus.CANCELLED:
            raise EventAlreadyCancelledError()

        if event.status == EventStatus.COMPLETED:
            raise EventAlreadyCompletedError()

        now = datetime.now(UTC)

        # Валидация времени начала
        start_time = event_data.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=UTC)
        if start_time < now:
            raise EventStartTimeInPastError()

        # Валидация времени окончания
        end_time = event_data.end_time
        if end_time is not None:
            if end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=UTC)
            if end_time <= start_time:
                raise EventEndTimeBeforeStartError()

        # Валидация max_participants
        if event_data.max_participants is not None:
            current_count = await EventRepository.count_participants(session, event.id)
            if event_data.max_participants < current_count:
                raise MaxParticipantsBelowCurrentError()

        if event_data.chat_type == ChatKind.DIRECT:
            raise InvalidChatTypeError()

        # Загружаем спорты
        sports = await SportRepository.get_by_ids(session, event_data.sport_ids)

        # Полное обновление всех полей
        if event.title != event_data.title or event.chat.type != event_data.chat_type:
            event.title = event_data.title
            event.chat = await ChatRepository.update(session, event.chat, event_data.chat_type, event_data.title)

        event.description = event_data.description
        event.category = event_data.category
        event.start_time = start_time
        event.end_time = end_time
        event.location = make_point(event_data.lat, event_data.lon)
        event.target_participants = event_data.target_participants
        event.max_participants = event_data.max_participants
        event.privacy = event_data.privacy
        event.difficulty = event_data.difficulty
        event.sports = sports

        event = await EventRepository.update(session, event)

        # Уведомляем участников об изменениях (кроме организатора)
        participant_ids = await EventRepository.get_active_participant_ids(session, event.id)
        for pid in participant_ids:
            if pid != user_id:
                await NotificationService.create_notification(
                    session=session,
                    user_id=pid,
                    notification_type=NotificationType.EVENT_UPDATED,
                    payload={"event_id": event.id, "event_title": event.title}
                )

        log.info("event.updated", event_id=event.id, user_id=user_id)
        return event

    @classmethod
    async def cancel_event(
        cls,
        session: AsyncSession,
        user_id: str,
        event_id: str
    ) -> Event:
        """Отмена мероприятия организатором."""
        event = await EventRepository.get_by_id(session, event_id)
        if not event:
            raise EventNotFoundError()

        if event.host_id != user_id:
            raise UserNotEventHostError()

        if event.status == EventStatus.CANCELLED:
            raise EventAlreadyCancelledError()

        event.status = EventStatus.CANCELLED
        await ChatRepository.soft_delete_chat(session, event.chat)
        event = await EventRepository.update(session, event)

        # Уведомляем участников об отмене (кроме организатора)
        participant_ids = await EventRepository.get_active_participant_ids(session, event_id)
        for pid in participant_ids:
            if pid != user_id:
                await NotificationService.create_notification(
                    session=session,
                    user_id=pid,
                    notification_type=NotificationType.EVENT_CANCELLED,
                    payload={"event_id": event.id, "event_title": event.title}
                )

        log.info("event.cancelled", event_id=event_id, user_id=user_id)
        return event

    @classmethod
    async def get_my_events(
        cls,
        session: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        statuses: Sequence[EventStatus] | None = None,
    ) -> tuple[list[Event], int, bool]:
        """
        Получение событий пользователя (где он host или участник).
        Возвращает (events, total_count, has_more).
        """
        limit = min(max(limit, 1), 100)

        events = await EventRepository.get_user_events(
            session,
            user_id=user_id,
            limit=limit + 1,
            offset=offset,
            statuses=statuses or None,
        )

        has_more = len(events) > limit
        if has_more:
            events = events[:limit]

        total_count = await EventRepository.count_user_events(
            session,
            user_id=user_id,
            statuses=statuses or None,
        )

        return events, total_count, has_more

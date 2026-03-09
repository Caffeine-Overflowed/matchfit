import json
from datetime import datetime
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.extensions.enums.notification_enums import NotificationType
from app.services.redis_service import RedisService
from app.services.translation_service import TranslationService
from app.utils.database import Database
from app.utils.observability import get_logger

log = get_logger()


class NotificationService:
    """Сервис управления уведомлениями."""

    _CHANNEL_PREFIX = "notifications:"

    @classmethod
    async def create_notification(
        cls,
        session: AsyncSession,
        user_id: str,
        notification_type: NotificationType,
        payload: dict,
    ) -> Notification:
        """Создание уведомления и публикация в Redis для real-time доставки."""
        notification = await NotificationRepository.create(
            session, user_id, notification_type, payload
        )

        # Публикация в Redis pub/sub для WebSocket subscriptions
        await cls._publish_notification(notification)

        log.info(
            "notification.created",
            notification_id=notification.id,
            user_id=user_id,
            type=notification_type.value,
        )

        return notification

    @classmethod
    async def get_notifications(
        cls,
        session: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        unread_only: bool = False,
    ) -> list[Notification]:
        """Получение уведомлений пользователя."""
        return await NotificationRepository.get_by_user(
            session, user_id, limit, offset, unread_only
        )

    @classmethod
    async def get_unread_count(
        cls,
        session: AsyncSession,
        user_id: str,
    ) -> int:
        """Получение количества непрочитанных уведомлений."""
        return await NotificationRepository.count_unread(session, user_id)

    @classmethod
    async def get_total_count(
        cls,
        session: AsyncSession,
        user_id: str,
    ) -> int:
        """Получение общего количества уведомлений."""
        return await NotificationRepository.count_total(session, user_id)

    @classmethod
    async def mark_as_read(
        cls,
        session: AsyncSession,
        notification_id: str,
        user_id: str,
    ) -> bool:
        """Отметить уведомление как прочитанное."""
        success = await NotificationRepository.mark_as_read(
            session, notification_id, user_id
        )

        if success:
            log.info(
                "notification.read",
                notification_id=notification_id,
                user_id=user_id,
            )

        return success

    @classmethod
    async def mark_all_as_read(
        cls,
        session: AsyncSession,
        user_id: str,
    ) -> int:
        """Отметить все уведомления как прочитанные."""
        count = await NotificationRepository.mark_all_as_read(session, user_id)

        log.info(
            "notification.all_read",
            user_id=user_id,
            count=count,
        )

        return count

    @classmethod
    async def _publish_notification(cls, notification: Notification) -> None:
        """Публикация уведомления в Redis pub/sub."""
        channel = f"{cls._CHANNEL_PREFIX}{notification.user_id}"
        message = json.dumps(
            {
                "id": notification.id,
                "type": notification.type.value,
                "payload": notification.payload,
                "created_at": notification.created_at.isoformat(),
            }
        )

        await RedisService.publish(channel, message)

    @classmethod
    async def subscribe(
        cls,
        user_id: str,
        locale: Optional[str] = None,
    ) -> AsyncGenerator[dict, None]:
        """
        Подписка на уведомления пользователя.
        Возвращает готовые данные для NotificationType без открытия DB сессий.
        """
        # Загружаем кэш переводов один раз при старте подписки
        async with Database.get_session() as session:
            await TranslationService.ensure_notification_cache(session)

        channel = f"{cls._CHANNEL_PREFIX}{user_id}"
        pubsub = await RedisService.subscribe(channel)

        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])

                    notification_type = NotificationType(data["type"])
                    created_at = datetime.fromisoformat(data["created_at"])

                    # Получаем title и text из кэша (без DB)
                    title, text = TranslationService.format_notification_cached(
                        notification_type.value,
                        data["payload"],
                        locale,
                    )

                    yield {
                        "id": data["id"],
                        "user_id": user_id,
                        "kind": notification_type,
                        "payload": data["payload"],
                        "title": title,
                        "text": text,
                        "read_at": None,
                        "created_at": created_at,
                    }
        finally:
            await RedisService.unsubscribe(pubsub, channel)

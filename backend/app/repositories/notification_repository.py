from datetime import datetime, UTC
from typing import Optional

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.extensions.enums.notification_enums import NotificationType


class NotificationRepository:
    @staticmethod
    async def create(
        session: AsyncSession,
        user_id: str,
        notification_type: NotificationType,
        payload: dict,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            payload=payload,
        )
        session.add(notification)
        await session.flush()
        await session.refresh(notification)
        return notification

    @staticmethod
    async def get_by_id(
        session: AsyncSession,
        notification_id: str,
    ) -> Optional[Notification]:
        result = await session.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_user(
        session: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        unread_only: bool = False,
    ) -> list[Notification]:
        query = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if unread_only:
            query = query.where(Notification.read_at.is_(None))

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def count_unread(session: AsyncSession, user_id: str) -> int:
        result = await session.execute(
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id)
            .where(Notification.read_at.is_(None))
        )
        return result.scalar() or 0

    @staticmethod
    async def count_total(session: AsyncSession, user_id: str) -> int:
        result = await session.execute(
            select(func.count(Notification.id)).where(Notification.user_id == user_id)
        )
        return result.scalar() or 0

    @staticmethod
    async def mark_as_read(
        session: AsyncSession,
        notification_id: str,
        user_id: str,
    ) -> bool:
        result = await session.execute(
            update(Notification)
            .where(Notification.id == notification_id)
            .where(Notification.user_id == user_id)
            .where(Notification.read_at.is_(None))
            .values(read_at=datetime.now(UTC))
        )
        return result.rowcount > 0

    @staticmethod
    async def mark_all_as_read(session: AsyncSession, user_id: str) -> int:
        result = await session.execute(
            update(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.read_at.is_(None))
            .values(read_at=datetime.now(UTC))
        )
        return result.rowcount

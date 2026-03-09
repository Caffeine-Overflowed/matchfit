from typing import Optional

import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.notification_type import NotificationConnection, NotificationType
from app.graphql.inputs.notification_inputs import GetNotificationsInput
from app.services.notification_service import NotificationService
from app.services.translation_service import TranslationService
from app.utils.database import Database


@strawberry.type
class NotificationQueries:
    @strawberry.field(
        description="Получить уведомления текущего пользователя",
        permission_classes=[IsAuthenticated],
    )
    async def notifications(
        self,
        info: Info[GQLContext, None],
        params: Optional[GetNotificationsInput] = None,
    ) -> NotificationConnection:
        user_id = info.context.auth_context.user_id
        locale = info.context.client_info.locale or "ru"

        # Defaults
        if params is None:
            params = GetNotificationsInput()

        # Ограничиваем limit для защиты от злоупотреблений
        limit = min(max(params.limit, 1), 100)

        async with Database.get_session() as session:
            notifications = await NotificationService.get_notifications(
                session,
                user_id,
                limit=limit + 1,
                offset=params.offset,
                unread_only=params.unread_only,
            )

            has_more = len(notifications) > limit
            if has_more:
                notifications = notifications[:limit]

            # Batch-загрузка переводов (2 запроса вместо 2*N)
            localized = await TranslationService.get_notifications_localized(
                session, notifications, locale
            )

            if params.unread_only:
                total_count = await NotificationService.get_unread_count(session, user_id)
            else:
                total_count = await NotificationService.get_total_count(session, user_id)

        items = [
            NotificationType(
                id=n.id,
                user_id=n.user_id,
                kind=n.type,
                payload=n.payload,
                title=title,
                text=text,
                read_at=n.read_at,
                created_at=n.created_at,
            )
            for n, (title, text) in zip(notifications, localized)
        ]

        return NotificationConnection(
            items=items,
            total_count=total_count,
            has_more=has_more,
        )

    @strawberry.field(
        description="Количество непрочитанных уведомлений",
        permission_classes=[IsAuthenticated],
    )
    async def unread_notifications_count(self, info: Info[GQLContext, None]) -> int:
        user_id = info.context.auth_context.user_id
        async with Database.get_session() as session:
            return await NotificationService.get_unread_count(session, user_id)

from typing import AsyncGenerator

import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.notification_type import NotificationType
from app.services.notification_service import NotificationService


@strawberry.type
class NotificationSubscriptions:
    @strawberry.subscription(
        description="Подписка на новые уведомления в реальном времени",
        permission_classes=[IsAuthenticated],
    )
    async def notification_received(
        self,
        info: Info[GQLContext, None],
    ) -> AsyncGenerator[NotificationType, None]:
        user_id = info.context.auth_context.user_id
        locale = info.context.client_info.locale or "ru"

        async for data in NotificationService.subscribe(user_id, locale):
            yield NotificationType(**data)

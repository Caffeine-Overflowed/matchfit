import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.notification_type import (
    MarkNotificationReadResult,
    MarkAllNotificationsReadResult,
)
from app.graphql.inputs.notification_inputs import MarkNotificationReadInput
from app.services.notification_service import NotificationService
from app.utils.database import Database


@strawberry.type
class NotificationMutations:
    @strawberry.mutation(
        description="Отметить уведомление как прочитанное",
        permission_classes=[IsAuthenticated],
    )
    async def mark_notification_read(
        self,
        info: Info[GQLContext, None],
        data: MarkNotificationReadInput,
    ) -> MarkNotificationReadResult:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            success = await NotificationService.mark_as_read(
                session,
                data.notification_id,
                user_id,
            )

        return MarkNotificationReadResult(
            success=success,
            notification_id=data.notification_id,
        )

    @strawberry.mutation(
        description="Отметить все уведомления как прочитанные",
        permission_classes=[IsAuthenticated],
    )
    async def mark_all_notifications_read(
        self,
        info: Info[GQLContext, None],
    ) -> MarkAllNotificationsReadResult:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            count = await NotificationService.mark_all_as_read(session, user_id)

        return MarkAllNotificationsReadResult(count=count)

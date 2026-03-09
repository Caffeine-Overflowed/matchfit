import strawberry


@strawberry.input(description="Параметры получения уведомлений")
class GetNotificationsInput:
    limit: int = strawberry.field(default=20, description="Количество уведомлений")
    offset: int = strawberry.field(default=0, description="Смещение для пагинации")
    unread_only: bool = strawberry.field(
        default=False, description="Только непрочитанные"
    )


@strawberry.input(description="ID уведомления для отметки прочитанным")
class MarkNotificationReadInput:
    notification_id: str = strawberry.field(description="UUID уведомления")

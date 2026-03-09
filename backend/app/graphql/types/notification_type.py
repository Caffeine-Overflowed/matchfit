import strawberry
from typing import Optional
from datetime import datetime
from strawberry.scalars import JSON

from app.extensions.enums.notification_enums import NotificationType as NotificationTypeEnum

# Регистрируем enum для GraphQL с явным именем
strawberry.enum(NotificationTypeEnum, name="NotificationKind", description="Типы уведомлений")


@strawberry.type(description="Уведомление")
class NotificationType:
    id: str = strawberry.field(description="UUID уведомления")
    user_id: str = strawberry.field(description="UUID получателя")
    kind: NotificationTypeEnum = strawberry.field(description="Тип уведомления")
    payload: JSON = strawberry.field(
        description="Данные уведомления (event_id, user_id, etc.)"
    )
    title: str = strawberry.field(description="Заголовок уведомления (локализованный)")
    text: str = strawberry.field(description="Текст уведомления (локализованный)")
    read_at: Optional[datetime] = strawberry.field(
        description="Время прочтения (null = не прочитано)"
    )
    created_at: datetime = strawberry.field(description="Время создания")
    @strawberry.field(description="Прочитано ли уведомление")
    def is_read(self) -> bool:
        return self.read_at is not None


@strawberry.type(description="Пагинированный список уведомлений")
class NotificationConnection:
    items: list[NotificationType] = strawberry.field(description="Список уведомлений")
    total_count: int = strawberry.field(description="Общее количество")
    has_more: bool = strawberry.field(description="Есть ли еще уведомления")


@strawberry.type(description="Результат отметки уведомления прочитанным")
class MarkNotificationReadResult:
    success: bool = strawberry.field(description="Успешно ли отмечено")
    notification_id: str = strawberry.field(description="ID уведомления")


@strawberry.type(description="Результат отметки всех уведомлений прочитанными")
class MarkAllNotificationsReadResult:
    count: int = strawberry.field(description="Количество отмеченных уведомлений")

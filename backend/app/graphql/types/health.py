import strawberry
from datetime import datetime


@strawberry.type(description="Результат проверки здоровья сервиса")
class HealthResult:
    status: str = strawberry.field(description="Статус сервиса")
    timestamp: datetime = strawberry.field(description="Время ответа")
    message: str | None = strawberry.field(default=None, description="Дополнительное сообщение")

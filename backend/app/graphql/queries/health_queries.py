import strawberry
from datetime import datetime, UTC

from app.graphql.types.health import HealthResult


@strawberry.type
class HealthQueries:
    @strawberry.field(description="Проверка доступности сервиса")
    def ping(self) -> HealthResult:
        return HealthResult(
            status="ok",
            timestamp=datetime.now(UTC),
        )

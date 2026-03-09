import strawberry
from datetime import datetime, UTC

from app.graphql.inputs.health_inputs import EchoInput
from app.graphql.types.health import HealthResult


@strawberry.type
class HealthMutations:
    @strawberry.mutation(description="Эхо-запрос с сообщением")
    def echo(self, data: EchoInput) -> HealthResult:
        return HealthResult(
            status="ok",
            timestamp=datetime.now(UTC),
            message=data.message,
        )

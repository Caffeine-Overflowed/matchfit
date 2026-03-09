import strawberry

from .auth_inputs import LoginInput, RefreshInput, RegisterInput
from .health_inputs import EchoInput


@strawberry.input(description="Параметры пагинации")
class PaginationInput:
    limit: int = strawberry.field(description="Сколько записей вернуть")
    offset: int = strawberry.field(description="Сколько записей пропустить")


__all__ = ["PaginationInput", "EchoInput", "LoginInput", "RefreshInput", "RegisterInput"]

from __future__ import annotations

import strawberry
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


@strawberry.type(description="Пользователь")
class UserType:
    id: str = strawberry.field(description="UUID пользователя")
    email: str = strawberry.field(description="Email пользователя")
    created_at: datetime = strawberry.field(description="Дата регистрации")

    @classmethod
    def from_model(cls, user: User) -> UserType:
        return cls(id=user.id, email=user.email, created_at=user.created_at)

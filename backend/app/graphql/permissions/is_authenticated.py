from typing import Any

from strawberry import Info
from strawberry.permission import BasePermission

from app.extensions.errors.auth import UnauthorizedError
from app.graphql.context.context import GQLContext


class IsAuthenticated(BasePermission):
    message = UnauthorizedError.CODE

    def has_permission(self, source: Any, info: Info[GQLContext], **kwargs) -> bool:
        return info.context.is_authenticated

    def on_unauthorized(self) -> None:
        raise UnauthorizedError()

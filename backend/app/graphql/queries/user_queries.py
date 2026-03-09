import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.user import UserType
from app.services.auth_service import AuthService
from app.utils.database import Database


@strawberry.type
class UserQueries:
    @strawberry.field(
        description="Получить текущего авторизованного пользователя",
        permission_classes=[IsAuthenticated],
    )
    async def me(self, info: Info[GQLContext, None]) -> UserType:
        async with Database.get_session() as session:
            user = await AuthService.get_current_user(session, info.context.auth_context.user_id)
        return UserType.from_model(user)

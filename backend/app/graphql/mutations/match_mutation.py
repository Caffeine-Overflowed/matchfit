import strawberry

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.services.match_service import MatchService
from app.utils.database import Database


@strawberry.type
class MatchMutations:
    @strawberry.mutation(description="обработка свайпа", permission_classes=[IsAuthenticated])
    async def swipe(
            self,
            info: strawberry.Info[GQLContext],
            target_id: str,
            is_liked: bool,
    ) -> bool:
        async with Database.get_session() as session:
            await MatchService.swipe(session=session,
                                     target_id=target_id,
                                     user_id=info.context.auth_context.user_id,
                                     is_liked=is_liked)
            return True

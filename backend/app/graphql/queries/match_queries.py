from typing import List

import strawberry
from strawberry import Info

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.match import UnstartedMatchType
from app.services.match_service import MatchService
from app.utils.database import Database

@strawberry.type
class MatchQueries:
    @strawberry.field(description="Получить неактивированные метчи пользователя", permission_classes=[IsAuthenticated])
    async def my_recent_matches(self, info: Info[GQLContext, None]) -> List[UnstartedMatchType]:
        async with Database.get_session() as session:
            return await MatchService.get_user_unstarted_matches(
                session=session,
                user_id=info.context.auth_context.user_id
            )
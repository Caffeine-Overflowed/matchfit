import strawberry
from typing import List

from app.graphql.types.goal import GoalType
from app.repositories.goal_repository import GoalRepository
from app.utils.database import Database


@strawberry.type
class GoalQueries:

    @strawberry.field(description="Получить список всех целей")
    async def goals(self) -> List[GoalType]:
        async with Database.get_session() as session:
            goals = await GoalRepository.get_all(session)
            return [
                GoalType(id=g.id, name=g.name, icon_url=g.icon_url, description=g.description)
                for g in goals
            ]

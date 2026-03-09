import strawberry
from typing import List

from app.graphql.types.sport import SportType
from app.repositories.sport_repository import SportRepository
from app.utils.database import Database


@strawberry.type
class SportQueries:

    @strawberry.field(description="Получить список всех видов спорта")
    async def sports(self) -> List[SportType]:
        async with Database.get_session() as session:
            sports = await SportRepository.get_all(session)
            return [
                SportType(id=s.id, name=s.name, icon_url=s.icon_url)
                for s in sports
            ]

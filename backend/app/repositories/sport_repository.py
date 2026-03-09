from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sport import Sport


class SportRepository:

    @staticmethod
    async def get_all(session: AsyncSession) -> List[Sport]:
        """Получить все виды спорта."""
        result = await session.execute(select(Sport).order_by(Sport.id))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_ids(session: AsyncSession, sport_ids: List[int]) -> List[Sport]:
        """Получение спортов по списку ID."""
        if not sport_ids:
            return []
        result = await session.execute(
            select(Sport).where(Sport.id.in_(sport_ids))
        )
        return list(result.scalars().all())

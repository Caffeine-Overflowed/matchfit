from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal


class GoalRepository:

    @staticmethod
    async def get_all(session: AsyncSession) -> List[Goal]:
        """Получить все цели."""
        result = await session.execute(select(Goal).order_by(Goal.id))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_ids(session: AsyncSession, goal_ids: List[int]) -> List[Goal]:
        if not goal_ids:
            return []
        result = await session.execute(
            select(Goal).where(Goal.id.in_(goal_ids))
        )
        return list(result.scalars().all())

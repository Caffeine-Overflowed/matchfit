from datetime import timedelta
from typing import Optional

from sqlalchemy import select, or_, func, exists
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.match import Match
from app.models.message import Message


class MatchRepository:
    @staticmethod
    async def create(
            session: AsyncSession,
            match: Match
    ) -> Match:
        session.add(match)
        await session.flush()
        # await session.refresh(match)
        # Refetch to avoid MissingGreenlet
        result = await session.execute(
            select(Match)
            .options(selectinload(Match.chat))
            .where(Match.id == match.id)
        )
        return result.scalar_one()

    @staticmethod
    async def get_existing_swipe(
        session: AsyncSession, 
        user_id: str, 
        target_id: str
    ) -> Optional[Match]:
        result = await session.execute(
            select(Match)
            .options(selectinload(Match.chat))
            .where(
                Match.user_id == user_id,
                Match.target_id == target_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def mark_as_matched(session: AsyncSession, match: Match):
        match.is_match = True

    @staticmethod
    async def get_user_unstarted_matches(session: AsyncSession, user_id: str) -> list[Match]:
        three_days_ago = func.now() - timedelta(days=3)

        # Подзапрос: есть ли сообщения в чате
        has_messages = exists(
            select(Message.id).where(Message.chat_id == Match.chat_id)
        )

        result = await session.execute(
            select(Match)
            .where(
                or_(
                    Match.user_id == user_id,
                    Match.target_id == user_id,
                )
            )
            .where(Match.chat_id.is_not(None))  # Чат должен быть создан
            .where(~has_messages)  # В чате нет сообщений
            .where(Match.created_at >= three_days_ago)  # Не старше 3 дней
            .order_by(Match.created_at.desc())  # Сначала свежие
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_matched_user_ids(
        session: AsyncSession,
        user_id: str
    ) -> list[str]:
        # User is either user_id or target_id in a match where is_match=True
        # We need the OTHER ID.
        query = select(Match.target_id).where(
            Match.user_id == user_id, 
            Match.is_match == True
        ).union(
            select(Match.user_id).where(
                Match.target_id == user_id, 
                Match.is_match == True
            )
        )
        result = await session.execute(query)
        return list(result.scalars().all())
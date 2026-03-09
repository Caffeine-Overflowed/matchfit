from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_participation import ChatParticipation


class ChatParticipationRepository:
    @staticmethod
    async def add_participant(
        session: AsyncSession,
        chat_id: str,
        user_id: str,
        is_host: bool = False,
    ) -> ChatParticipation:
        """Add a user to a chat."""
        participation = ChatParticipation(
            chat_id=chat_id, user_id=user_id, is_host=is_host
        )
        session.add(participation)
        await session.flush()
        return participation

    @staticmethod
    async def get_participation(
        session: AsyncSession,
        chat_id: str,
        user_id: str,
    ) -> Optional[ChatParticipation]:
        """Get participation record for a user in a chat."""
        result = await session.execute(
            select(ChatParticipation).where(
                and_(
                    ChatParticipation.chat_id == chat_id,
                    ChatParticipation.user_id == user_id,
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_last_read(
        session: AsyncSession,
        chat_id: str,
        user_id: str,
        message_id: str,
    ) -> Optional[ChatParticipation]:
        """Update last_read_at (message_id) for a user in a chat."""
        participation = await ChatParticipationRepository.get_participation(
            session, chat_id, user_id
        )
        if participation:
            participation.last_read_at = message_id
            await session.flush()
        return participation

    @staticmethod
    async def get_chat_participants(
        session: AsyncSession,
        chat_id: str,
    ) -> List[ChatParticipation]:
        """Get all participants of a chat."""
        result = await session.execute(
            select(ChatParticipation)
            .where(ChatParticipation.chat_id == chat_id)
            .order_by(ChatParticipation.joined_at)
        )
        return list(result.scalars().all())

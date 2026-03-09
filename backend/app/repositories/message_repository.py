from datetime import datetime
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.message import Message


class MessageRepository:
    @staticmethod
    async def create(
        session: AsyncSession,
        sender_id: str,
        chat_id: str,
        content: str,
    ) -> Message:
        """Create a new message."""
        message = Message(
            sender_id=sender_id,
            chat_id=chat_id,
            content=content,
        )
        session.add(message)
        await session.flush()
        await session.refresh(message, ["sender"])
        return message

    @staticmethod
    async def get_by_id(
        session: AsyncSession,
        message_id: str,
        load_sender: bool = False,
    ) -> Optional[Message]:
        """Get message by ID."""
        query = select(Message).where(Message.id == message_id)

        if load_sender:
            query = query.options(selectinload(Message.sender))

        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_chat_messages(
        session: AsyncSession,
        chat_id: str,
        limit: int = 50,
        cursor_sent_at: Optional[datetime] = None,
        cursor_id: Optional[str] = None,
    ) -> List[Message]:
        """
        Get messages for a chat with cursor-based pagination.
        Returns messages older than the cursor (for infinite scroll).
        """
        query = (
            select(Message)
            .where(Message.chat_id == chat_id)
            .options(selectinload(Message.sender))
        )

        # Cursor-based pagination: messages before the cursor
        if cursor_sent_at and cursor_id:
            query = query.where(
                (Message.sent_at < cursor_sent_at)
                | (and_(Message.sent_at == cursor_sent_at, Message.id < cursor_id))
            )

        query = query.order_by(Message.sent_at.desc(), Message.id.desc()).limit(limit)

        result = await session.execute(query)
        messages = list(result.scalars().all())

        # Reverse to get chronological order (oldest first)
        return list(reversed(messages))

    @staticmethod
    async def get_latest_message(
        session: AsyncSession,
        chat_id: str,
    ) -> Optional[Message]:
        """Get the latest message in a chat."""
        result = await session.execute(
            select(Message)
            .where(Message.chat_id == chat_id)
            .order_by(Message.sent_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_system_message(
        session: AsyncSession,
        chat_id: str,
        sender_id: str,
        content: str,
    ) -> Message:
        """Create a system message."""
        message = Message(
            sender_id=sender_id,
            chat_id=chat_id,
            content=content,
            is_system=True,
        )
        session.add(message)
        await session.flush()
        return message

from typing import Dict, List, Optional

from sqlalchemy import and_, case, desc, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.extensions.enums.chat_enums import ChatKind
from app.models.chat import Chat
from app.models.chat_participation import ChatParticipation
from app.models.message import Message
from app.models.user import User
from app.models.profile import Profile
from app.extensions.dtos.chat_dtos import (
    ChatDTO,
    ChatListItemDTO,
    MessageDTO,
    ProfileDTO,
    UserDTO,
)

class ChatRepository:
    @staticmethod
    async def create(
        session: AsyncSession,
        chat_type: ChatKind,
        title: Optional[str] = None,
        image_file_name: Optional[str] = None,
    ) -> Chat:
        """Create a new chat."""
        chat = Chat(
            type=chat_type,
            title=title,
            image_file_name=image_file_name,
        )
        session.add(chat)
        await session.flush()
        return chat

    @staticmethod
    async def update(
        session: AsyncSession,
        chat: Chat,
        chat_type: ChatKind,
        title,
    ) -> Chat:
        """Update chat details."""
        if title is not None:
            chat.title = title
        if chat_type is not None:
            chat.type = chat_type
        await session.flush()
        return chat



    @staticmethod
    async def get_by_id(
        session: AsyncSession,
        chat_id: str,
        load_participants: bool = False,
        load_event: bool = False,
    ) -> Optional[Chat]:
        """Get chat by ID with optional relationship loading."""
        query = select(Chat).where(Chat.id == chat_id)

        if load_participants:
            query = query.options(selectinload(Chat.participants))

        if load_event:
            query = query.options(selectinload(Chat.event))

        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_direct_chat_between_users(
        session: AsyncSession,
        user1_id: str,
        user2_id: str,
    ) -> Optional[Chat]:
        """Find existing direct chat between two users."""
        # Subquery to find chats where both users are participants
        subquery = (
            select(ChatParticipation.chat_id)
            .where(ChatParticipation.user_id.in_([user1_id, user2_id]))
            .group_by(ChatParticipation.chat_id)
            .having(func.count(ChatParticipation.user_id) == 2)
        )

        result = await session.execute(
            select(Chat).where(
                and_(
                    Chat.type == ChatKind.DIRECT,
                    Chat.id.in_(subquery),
                    Chat.is_deleted == False
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_chats(
        session: AsyncSession,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ChatListItemDTO]:
        """
        Get all chats for a user with enriched data using raw SQL.

        Returns:
        - Last message with sender info
        - Unread count and status
        - For direct chats: other user info with profile

        Sorted by last message timestamp (most recent first).
        Uses CTEs with window functions for better performance.
        """

        query = text("""
            WITH latest_messages AS (
                -- Get the latest message for each chat using ROW_NUMBER window function
                SELECT
                    m.*,
                    ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.sent_at DESC, m.id DESC) as rn
                FROM messages m
            ),
            chat_stats AS (
                -- Calculate unread count for each chat
                -- Join with last_read message to get its timestamp for proper comparison
                SELECT
                    cp.chat_id,
                    cp.last_read_at as last_read_msg_id,
                    last_read_msg.sent_at as last_read_sent_at,
                    COUNT(m.id) FILTER (
                        WHERE cp.last_read_at IS NULL
                        OR m.sent_at > last_read_msg.sent_at
                        OR (m.sent_at = last_read_msg.sent_at AND m.id > cp.last_read_at)
                    ) as unread_count
                FROM chat_participations cp
                LEFT JOIN messages last_read_msg ON last_read_msg.id = cp.last_read_at
                LEFT JOIN messages m ON m.chat_id = cp.chat_id
                WHERE cp.user_id = :user_id
                GROUP BY cp.chat_id, cp.last_read_at, last_read_msg.sent_at
            )
            SELECT
                -- Chat info
                c.id as chat_id,
                c.type as chat_type,
                c.title as chat_title,
                c.image_file_name as chat_image,
                c.created_at as chat_created_at,

                -- Last message info
                lm.id as msg_id,
                lm.content as msg_content,
                lm.sent_at as msg_sent_at,
                lm.sender_id as msg_sender_id,

                -- Message sender info
                sender.email as sender_email,

                -- Other user info (for direct chats)
                other_user.id as other_user_id,
                other_user.email as other_user_email,
                other_user.created_at as other_user_created_at,

                -- Other user profile (for avatar)
                other_profile.avatar_pic_name as other_avatar,

                -- Unread stats
                cs.unread_count,
                cs.last_read_msg_id,
                cs.last_read_sent_at,

                -- Calculated fields
                CASE
                    WHEN lm.id IS NOT NULL AND (
                        cs.last_read_sent_at IS NULL
                        OR lm.sent_at > cs.last_read_sent_at
                        OR (lm.sent_at = cs.last_read_sent_at AND lm.id > cs.last_read_msg_id)
                    )
                    THEN true
                    ELSE false
                END as has_unread,

                CASE
                    WHEN lm.id IS NOT NULL AND cs.last_read_sent_at IS NOT NULL AND (
                        lm.sent_at < cs.last_read_sent_at
                        OR (lm.sent_at = cs.last_read_sent_at AND lm.id <= cs.last_read_msg_id)
                    )
                    THEN true
                    ELSE false
                END as is_last_msg_read

            FROM chats c

            -- Join with user's participation
            INNER JOIN chat_participations user_cp
                ON user_cp.chat_id = c.id
                AND user_cp.user_id = :user_id

            -- Join with latest message
            LEFT JOIN latest_messages lm
                ON lm.chat_id = c.id
                AND lm.rn = 1

            -- Join with message sender
            LEFT JOIN users sender
                ON sender.id = lm.sender_id

            -- Join with chat stats
            LEFT JOIN chat_stats cs
                ON cs.chat_id = c.id

            -- Join with other participant (for direct chats)
            LEFT JOIN chat_participations other_cp
                ON other_cp.chat_id = c.id
                AND other_cp.user_id != :user_id
                AND c.type = 'direct'

            LEFT JOIN users other_user
                ON other_user.id = other_cp.user_id

            LEFT JOIN profiles other_profile
                ON other_profile.user_id = other_user.id

            WHERE c.is_deleted = false
                AND lm.id IS NOT NULL  -- Only chats with messages

            ORDER BY COALESCE(lm.sent_at, c.created_at) DESC

            LIMIT :limit OFFSET :offset
        """)

        result = await session.execute(
            query,
            {
                "user_id": user_id,
                "limit": limit,
                "offset": offset,
            }
        )

        rows = result.fetchall()

        # Transform to dict format (compatible with existing code)
        enriched_chats = []
        for row in rows:
            chat_dto = ChatRepository.map_row_to_chat_dto(row)
            enriched_chats.append(chat_dto)
        return enriched_chats

    @staticmethod
    def map_row_to_chat_dto(row) -> ChatListItemDTO:
        chat = ChatDTO(
            id=row.chat_id,
            type=row.chat_type,
            title=row.chat_title,
            image_file_name=row.chat_image,
            created_at=row.chat_created_at,
        )

        last_message = (
            MessageDTO(
                id=row.msg_id,
                content=row.msg_content,
                sent_at=row.msg_sent_at,
                sender_id=row.msg_sender_id,
            )
            if row.msg_id
            else None
        )

        message_sender = (
            UserDTO(
                id=row.msg_sender_id,
                email=row.sender_email,
            )
            if row.msg_sender_id
            else None
        )

        other_user = (
            UserDTO(
                id=row.other_user_id,
                email=row.other_user_email,
                created_at=row.other_user_created_at,
            )
            if row.other_user_id
            else None
        )

        other_user_profile = (
            ProfileDTO(
                avatar_pic_name=row.other_avatar,
            )
            if row.other_avatar
            else None
        )

        return ChatListItemDTO(
            chat=chat,
            last_message=last_message,
            message_sender=message_sender,
            other_user=other_user,
            other_user_profile=other_user_profile,
            has_unread=row.has_unread,
            unread_count=row.unread_count or 0,
            is_last_msg_read=row.is_last_msg_read,
        )

    @staticmethod
    async def is_user_member(
        session: AsyncSession,
        chat_id: str,
        user_id: str,
    ) -> bool:
        """Check if user is a member of the chat."""
        result = await session.execute(
            select(ChatParticipation.id)
            .where(
                and_(
                    ChatParticipation.chat_id == chat_id,
                    ChatParticipation.user_id == user_id,
                )
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_chat_host_id(
        session: AsyncSession,
        chat_id: str,
    ) -> Optional[str]:
        """Get the host user_id for a chat (from ChatParticipation with is_host=True)."""
        result = await session.execute(
            select(ChatParticipation.user_id)
            .where(
                and_(
                    ChatParticipation.chat_id == chat_id,
                    ChatParticipation.is_host == True,  # noqa: E712
                )
            )
            .limit(1)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def soft_delete_chat(
        session: AsyncSession,
        chat: Chat,
    ) -> None:
        """Soft delete a chat by setting is_deleted to True."""
        chat.is_deleted = True
        await session.flush()
        return None

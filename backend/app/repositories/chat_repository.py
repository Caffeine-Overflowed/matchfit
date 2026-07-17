from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.extensions.enums.chat_enums import ChatKind
from app.models.chat import Chat
from app.models.chat_participation import ChatParticipation
from app.models.message import Message
from app.models.user import User
from app.models.profile import Profile


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
    async def get_user_chat_list(
        session: AsyncSession, user_id: str, limit: int, offset: int
    ) -> List[Tuple[Chat, Message]]:
        rn = func.row_number().over(
            partition_by=Message.chat_id,
            order_by=(Message.sent_at.desc(), Message.id.desc()),
        ).label("rn")
        ranked = (
            select(
                Message.id.label("msg_id"),
                Message.chat_id.label("chat_id"),
                Message.sent_at.label("sent_at"),
                rn,
            )
            .join(
                ChatParticipation,
                and_(
                    ChatParticipation.chat_id == Message.chat_id,
                    ChatParticipation.user_id == user_id,
                ),
            )
            .join(Chat, Chat.id == Message.chat_id)
            .where(Chat.is_deleted.is_(False))
            .subquery()
        )
        latest = (
            select(ranked.c.chat_id, ranked.c.msg_id)
            .where(ranked.c.rn == 1)
            .order_by(ranked.c.sent_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = (await session.execute(latest)).all()
        if not rows:
            return []
        chat_ids = [r.chat_id for r in rows]
        msg_ids = [r.msg_id for r in rows]
        chats = {
            c.id: c
            for c in (
                await session.execute(select(Chat).where(Chat.id.in_(chat_ids)))
            ).scalars().all()
        }
        msgs = {
            m.id: m
            for m in (
                await session.execute(
                    select(Message)
                    .where(Message.id.in_(msg_ids))
                    .options(selectinload(Message.sender))
                )
            ).scalars().all()
        }
        return [(chats[r.chat_id], msgs[r.msg_id]) for r in rows]

    @staticmethod
    async def get_last_messages(
        session: AsyncSession, chat_ids: List[str]
    ) -> Dict[str, Message]:
        if not chat_ids:
            return {}
        stmt = (
            select(Message)
            .where(Message.chat_id.in_(chat_ids))
            .distinct(Message.chat_id)
            .order_by(Message.chat_id, Message.sent_at.desc(), Message.id.desc())
            .options(selectinload(Message.sender))
        )
        rows = (await session.execute(stmt)).scalars().all()
        return {m.chat_id: m for m in rows}

    @staticmethod
    async def get_read_states(
        session: AsyncSession, chat_ids: List[str], user_id: str
    ) -> Dict[str, Optional[datetime]]:
        if not chat_ids:
            return {}
        stmt = select(
            ChatParticipation.chat_id, ChatParticipation.last_read_at
        ).where(
            ChatParticipation.chat_id.in_(chat_ids),
            ChatParticipation.user_id == user_id,
        )
        rows = (await session.execute(stmt)).all()
        return {chat_id: last_read for chat_id, last_read in rows}

    @staticmethod
    async def get_unread_counts(
        session: AsyncSession, chat_ids: List[str], user_id: str
    ) -> Dict[str, int]:
        if not chat_ids:
            return {}
        stmt = (
            select(Message.chat_id, func.count(Message.id))
            .join(
                ChatParticipation,
                and_(
                    ChatParticipation.chat_id == Message.chat_id,
                    ChatParticipation.user_id == user_id,
                ),
            )
            .where(
                Message.chat_id.in_(chat_ids),
                or_(
                    ChatParticipation.last_read_at.is_(None),
                    Message.sent_at > ChatParticipation.last_read_at,
                ),
            )
            .group_by(Message.chat_id)
        )
        rows = (await session.execute(stmt)).all()
        counts = {chat_id: count for chat_id, count in rows}
        return {cid: counts.get(cid, 0) for cid in chat_ids}

    @staticmethod
    async def get_other_users(
        session: AsyncSession, chat_ids: List[str], user_id: str
    ) -> Dict[str, Tuple[User, Optional[str]]]:
        if not chat_ids:
            return {}
        stmt = (
            select(ChatParticipation.chat_id, User, Profile.avatar_pic_name)
            .join(User, User.id == ChatParticipation.user_id)
            .join(Chat, Chat.id == ChatParticipation.chat_id)
            .outerjoin(Profile, Profile.user_id == User.id)
            .where(
                ChatParticipation.chat_id.in_(chat_ids),
                ChatParticipation.user_id != user_id,
                Chat.type == ChatKind.DIRECT.value,
            )
        )
        rows = (await session.execute(stmt)).all()
        return {chat_id: (user, avatar) for chat_id, user, avatar in rows}

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

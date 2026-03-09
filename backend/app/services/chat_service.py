from typing import Dict, List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.dtos.chat_dtos import ChatListItemDTO
from app.models.profile import Profile
from app.extensions.errors.messenger import (
    CannotAddSelfToDirectChatError,
    ChatNotFoundError,
    NotChatMemberError,
    UnauthorizedToDeleteError,
)
from app.extensions.enums.chat_enums import ChatKind
from app.models.chat import Chat
from app.repositories.chat_participation_repository import (
    ChatParticipationRepository,
)
from app.repositories.chat_repository import ChatRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.profile_repository import ProfileRepository
from app.utils.observability import get_logger

log = get_logger()


class ChatService:
    @classmethod
    async def create_direct_chat(
        cls,
        session: AsyncSession,
        user1_id: str,
        user2_id: str,
    ) -> Chat:
        """
        Create or get existing direct chat between two users.
        """
        if user1_id == user2_id:
            raise CannotAddSelfToDirectChatError()

        # Check if direct chat already exists
        existing_chat = await ChatRepository.get_direct_chat_between_users(
            session, user1_id, user2_id
        )

        if existing_chat:
            log.debug("direct_chat.exists", chat_id=existing_chat.id)
            return existing_chat

        # Create new direct chat
        chat = await ChatRepository.create(
            session=session,
            chat_type=ChatKind.DIRECT,
            title=None,
        )

        # Add both participants
        await ChatParticipationRepository.add_participant(
            session, chat.id, user1_id, is_host=False
        )
        await ChatParticipationRepository.add_participant(
            session, chat.id, user2_id, is_host=False
        )

        log.info(
            "direct_chat.created",
            chat_id=chat.id,
            user1_id=user1_id,
            user2_id=user2_id,
        )
        return chat

    @classmethod
    async def create_channel(
        cls,
        session: AsyncSession,
        host_id: str,
        title: str,
        participant_ids: Optional[List[str]] = None,
    ) -> Chat:
        """
        Create a channel chat (only host can send messages).
        """
        chat = await ChatRepository.create(
            session=session,
            chat_type=ChatKind.CHANNEL,
            title=title,
        )

        # Add host as participant with is_host=True
        await ChatParticipationRepository.add_participant(
            session, chat.id, host_id, is_host=True
        )

        # Add other participants if provided
        if participant_ids:
            for user_id in participant_ids:
                if user_id != host_id:
                    await ChatParticipationRepository.add_participant(
                        session, chat.id, user_id, is_host=False
                    )

        log.info("channel.created", chat_id=chat.id, host_id=host_id, title=title)
        return chat

    @classmethod
    async def create_group(
        cls,
        session: AsyncSession,
        host_id: str,
        title: str,
        participant_ids: Optional[List[str]] = None,
    ) -> Chat:
        """
        Create a group chat (all members can send messages).
        """
        chat = await ChatRepository.create(
            session=session,
            chat_type=ChatKind.GROUP,
            title=title,
        )

        # Add host as participant with is_host=True
        await ChatParticipationRepository.add_participant(
            session, chat.id, host_id, is_host=True
        )

        # Add other participants if provided
        if participant_ids:
            for user_id in participant_ids:
                if user_id != host_id:
                    await ChatParticipationRepository.add_participant(
                        session, chat.id, user_id, is_host=False
                    )

        log.info("group.created", chat_id=chat.id, host_id=host_id, title=title)
        return chat

    @classmethod
    async def get_chat(
        cls,
        session: AsyncSession,
        chat_id: str,
        user_id: str,
    ) -> Chat:
        """
        Get chat by ID. Validates that user is a member.
        """
        chat = await ChatRepository.get_by_id(
            session, chat_id, load_participants=True, load_event=True
        )

        if not chat or chat.is_deleted:
            raise ChatNotFoundError()

        # Verify user is a member (using already loaded participants)
        is_member = any(p.user_id == user_id for p in chat.participants)
        if not is_member:
            raise NotChatMemberError()

        return chat

    @classmethod
    async def get_chat_info(
        cls,
        session: AsyncSession,
        chat_id: str,
        user_id: str,
    ) -> Tuple[Chat, Optional[Profile], Optional[str]]:
        """
        Get detailed chat info including other user's profile for direct chats.
        Returns: (chat, other_user_profile, image)
        """
        chat = await cls.get_chat(session, chat_id, user_id)

        other_user_profile = None
        image = chat.image_file_name

        if chat.type == ChatKind.DIRECT:
            # Находим участника, который НЕ текущий пользователь
            other_participant = next(
                (p for p in chat.participants if p.user_id != user_id),
                None
            )
            if other_participant:
                other_user_profile = await ProfileRepository.get_by_user_id(
                    session, other_participant.user_id
                )
                if other_user_profile:
                    image = other_user_profile.avatar_pic_name

        return chat, other_user_profile, image

    @classmethod
    async def get_user_chats(
        cls,
        session: AsyncSession,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ChatListItemDTO]:
        """
        Get all chats for a user with enriched data:
        - Last message with sender
        - Unread status
        - Other user info (for direct chats)
        """
        return await ChatRepository.get_user_chats(session, user_id, limit, offset)

    @classmethod
    async def mark_as_read(
        cls,
        session: AsyncSession,
        chat_id: str,
        user_id: str,
    ) -> None:
        """
        Mark all messages in a chat as read for a user.
        Updates last_read_at to the latest message_id.
        """
        # Verify user is a member
        is_member = await ChatRepository.is_user_member(session, chat_id, user_id)
        if not is_member:
            raise NotChatMemberError()

        # Get latest message in chat
        latest_message = await MessageRepository.get_latest_message(session, chat_id)

        if latest_message:
            # Update last_read_at to latest message_id
            await ChatParticipationRepository.update_last_read(
                session, chat_id, user_id, latest_message.id
            )

            log.debug(
                "chat.marked_read",
                chat_id=chat_id,
                user_id=user_id,
                message_id=latest_message.id,
            )

    @classmethod
    async def delete_chat(
        cls,
        session: AsyncSession,
        chat_id: str,
        user_id: str,
    ) -> None:
        """
        Delete a chat. Only the host can delete channels/groups.
        Anyone can delete a direct chat.
        """
        chat = await ChatRepository.get_by_id(session, chat_id)
        if not chat:
            raise ChatNotFoundError()

        # Verify user is a member
        is_member = await ChatRepository.is_user_member(session, chat_id, user_id)
        if not is_member:
            raise NotChatMemberError()

        # For channels/groups, only host can delete
        if chat.type in [ChatKind.CHANNEL, ChatKind.GROUP]:
            # Check if user is host
            participation = await ChatParticipationRepository.get_participation(
                session, chat_id, user_id
            )
            if not participation or not participation.is_host:
                raise UnauthorizedToDeleteError()

        # Soft delete the chat by setting is_deleted=True
        log.info("chat.deleting", chat_id=chat_id, user_id=user_id, chat_type=chat.type.value)

        await ChatRepository.soft_delete_chat(session, chat)

        log.info("chat.deleted_success", chat_id=chat_id, user_id=user_id)

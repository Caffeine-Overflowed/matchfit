import asyncio
import json
from datetime import datetime
from typing import AsyncGenerator, List, Optional, Set, Tuple

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.errors.messenger import (
    ChatNotFoundError,
    EmptyMessageError,
    MessageTooLongError,
    NotChatMemberError,
    UnauthorizedToSendError,
)
from app.extensions.enums.chat_enums import ChatKind
from app.models.message import Message
from app.repositories.chat_repository import ChatRepository
from app.repositories.message_repository import MessageRepository
from app.services.redis_service import RedisService
from app.utils.observability import get_logger

log = get_logger()


class MessageService:
    _CHANNEL_PREFIX = "chat:"
    _MAX_CONTENT_LENGTH = 4000

    # Strong references to fire-and-forget publish tasks so they are not
    # garbage-collected before completing.
    _publish_tasks: Set[asyncio.Task] = set()

    @classmethod
    async def send_message(
        cls,
        session: AsyncSession,
        sender_id: str,
        chat_id: str,
        content: str,
    ) -> Message:
        """
        Send a message to a chat.
        Validates permissions based on chat type.
        """
        # Validate content
        content = content.strip()
        if not content:
            raise EmptyMessageError()
        if len(content) > cls._MAX_CONTENT_LENGTH:
            raise MessageTooLongError()

        # Get chat and verify it exists and is not deleted
        chat = await ChatRepository.get_by_id(session, chat_id)
        if not chat or chat.is_deleted:
            raise ChatNotFoundError()

        # Verify sender is a member
        is_member = await ChatRepository.is_user_member(session, chat_id, sender_id)
        if not is_member:
            raise NotChatMemberError()

        # For channels, only host can send messages
        if chat.type == ChatKind.CHANNEL:
            host_id = await ChatRepository.get_chat_host_id(session, chat_id)
            if host_id != sender_id:
                raise UnauthorizedToSendError()

        # Create message
        message = await MessageRepository.create(
            session=session,
            sender_id=sender_id,
            chat_id=chat_id,
            content=content,
        )

        # Publish to Redis for realtime delivery — deferred until the
        # surrounding transaction commits, so subscribers never receive
        # messages that end up rolled back.
        cls._publish_message_after_commit(session, message)

        log.info(
            "message.sent",
            message_id=message.id,
            chat_id=chat_id,
            sender_id=sender_id,
        )
        return message

    @classmethod
    def _publish_message_after_commit(
        cls, session: AsyncSession, message: Message
    ) -> None:
        """Publish message to Redis pub/sub once the transaction commits."""
        channel = f"{cls._CHANNEL_PREFIX}{message.chat_id}"
        # Serialize now, while the ORM object and its relationships are loaded
        data = json.dumps({
            "id": message.id,
            "chat_id": message.chat_id,
            "sender_id": message.sender_id,
            "sender_email": message.sender.email if message.sender else None,
            "content": message.content,
            "sent_at": message.sent_at.isoformat(),
        })
        loop = asyncio.get_running_loop()

        # after_commit fires in the loop's thread (via greenlet), so it is
        # safe to schedule the async publish on the captured loop. If the
        # transaction rolls back, the listener never fires.
        @event.listens_for(session.sync_session, "after_commit", once=True)
        def _publish(_sync_session) -> None:
            task = loop.create_task(RedisService.publish(channel, data))
            cls._publish_tasks.add(task)
            task.add_done_callback(cls._publish_tasks.discard)

    @classmethod
    async def subscribe(
        cls,
        chat_id: str,
        user_id: str,
    ) -> AsyncGenerator[dict, None]:
        """
        Subscribe to new messages in a chat.
        Yields message data for MessageType.
        """
        channel = f"{cls._CHANNEL_PREFIX}{chat_id}"
        pubsub = await RedisService.subscribe(channel)

        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    yield {
                        "id": data["id"],
                        "chat_id": data["chat_id"],
                        "sender_id": data["sender_id"],
                        "sender_email": data["sender_email"],
                        "content": data["content"],
                        "sent_at": datetime.fromisoformat(data["sent_at"]),
                    }
        finally:
            await RedisService.unsubscribe(pubsub, channel)

    @classmethod
    async def get_messages(
        cls,
        session: AsyncSession,
        user_id: str,
        chat_id: str,
        limit: int = 50,
        cursor_sent_at: Optional[datetime] = None,
        cursor_id: Optional[str] = None,
    ) -> Tuple[List[Message], bool]:
        """
        Get messages for a chat with cursor-based pagination.
        Returns (messages, has_more).
        """
        # Verify user is a member
        is_member = await ChatRepository.is_user_member(session, chat_id, user_id)
        if not is_member:
            raise NotChatMemberError()

        # Fetch messages (limit + 1 to check if there are more)
        messages = await MessageRepository.get_chat_messages(
            session=session,
            chat_id=chat_id,
            limit=limit + 1,
            cursor_sent_at=cursor_sent_at,
            cursor_id=cursor_id,
        )

        # Check if there are more messages.
        # The list is chronological (oldest first), so the extra sentinel
        # row is at the FRONT — drop it there to keep the newest `limit`.
        has_more = len(messages) > limit
        if has_more:
            messages = messages[1:]

        return messages, has_more

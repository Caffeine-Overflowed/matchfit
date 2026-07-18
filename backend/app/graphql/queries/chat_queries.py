from typing import List

import strawberry
from strawberry.types import Info

from app.extensions.enums.chat_enums import ChatKind
from app.graphql.inputs.chat_inputs import GetMessagesInput
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.chat import (
    ChatType,
    MessageSenderType,
    MessageType,
    PaginatedMessagesType,
    ChatInfoType,
)
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.utils.database import Database



@strawberry.type
class ChatQueries:
    @strawberry.field(
        description="Get a specific chat by ID", permission_classes=[IsAuthenticated]
    )
    async def chat_info(self, info: Info, chat_id: str) -> ChatInfoType:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            chat = await ChatService.get_chat(session, chat_id, user_id)

            return ChatInfoType(
                id=chat.id,
                type=ChatKind(chat.type),
                title=chat.title,
                is_deleted=chat.is_deleted,
                event=chat.event,
                _group_image=chat.image_file_name,
            )

    @strawberry.field(
        description="Get all chats for current user with last message and unread status",
        permission_classes=[IsAuthenticated],
    )
    async def my_chats(
            self, info: Info, limit: int = 50, offset: int = 0
    ) -> List[ChatType]:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            pairs = await ChatService.get_user_chats(session, user_id, limit, offset)

        return [
            ChatType(
                id=chat.id,
                type=ChatKind(chat.type),
                title=chat.title,
                created_at=chat.created_at,
                participants=[],
                _group_image=chat.image_file_name,
                _last_message=last_message,
                _has_prefill=True,
            )
            for chat, last_message in pairs
        ]

    @strawberry.field(
        description="Get messages in a chat with cursor-based pagination",
        permission_classes=[IsAuthenticated],
    )
    async def chat_messages(
        self, info: Info, input: GetMessagesInput
    ) -> PaginatedMessagesType:
        user_id = info.context.auth_context.user_id

        # Validate limit
        limit = min(input.limit or 50, 100)

        async with Database.get_session() as session:
            messages, has_more = await MessageService.get_messages(
                session=session,
                user_id=user_id,
                chat_id=input.chat_id,
                limit=limit,
                cursor_sent_at=input.cursor_sent_at,
                cursor_id=input.cursor_id,
            )

            # Prepare next cursor — pagination walks backwards through
            # history, so the cursor is the OLDEST returned message
            # (messages are chronological, oldest first).
            next_cursor_sent_at = None
            next_cursor_id = None
            if has_more and messages:
                oldest_message = messages[0]
                next_cursor_sent_at = oldest_message.sent_at
                next_cursor_id = oldest_message.id

            return PaginatedMessagesType(
                messages=[
                    MessageType(
                        id=msg.id,
                        chat_id=msg.chat_id,
                        sender=MessageSenderType(
                            id=msg.sender.id,
                            email=msg.sender.email,
                        ),
                        content=msg.content,
                        sent_at=msg.sent_at,
                    )
                    for msg in messages
                ],
                has_more=has_more,
                next_cursor_sent_at=next_cursor_sent_at,
                next_cursor_id=next_cursor_id,
            )



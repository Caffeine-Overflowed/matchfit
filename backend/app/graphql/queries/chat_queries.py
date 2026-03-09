from typing import List

import strawberry

from app.extensions.enums.chat_enums import ChatKind
from app.graphql.inputs.chat_inputs import GetMessagesInput
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.auth import UserType
from app.graphql.types.chat import (
    ChatType,
    LastMessagePreview,
    MessageSenderType,
    MessageType,
    PaginatedMessagesType,
    ChatInfoType,
)
from app.graphql.types.profile import ProfileType
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.utils.database import Database
from app.utils.minio import MinioService, MinioFolder



@strawberry.type
class ChatQueries:
    @strawberry.field(
        description="Get a specific chat by ID", permission_classes=[IsAuthenticated]
    )
    async def chat_info(self, info, chat_id: str) -> ChatInfoType:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            chat, other_user_profile, image = await ChatService.get_chat_info(
                session, chat_id, user_id
            )

            return ChatInfoType(
                id=chat.id,
                type=chat.type,
                title=chat.title,
                image_file_name=MinioService.form_link(MinioFolder.CHAT_AVATARS, image),
                is_deleted=chat.is_deleted,
                event=chat.event,
                profile=(
                    ProfileType.from_model(other_user_profile)
                    if other_user_profile else None
                ),
            )

    @strawberry.field(
        description="Get all chats for current user with last message and unread status",
        permission_classes=[IsAuthenticated],
    )
    async def my_chats(
            self, info, limit: int = 50, offset: int = 0
    ) -> List[ChatType]:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            enriched_chats = await ChatService.get_user_chats(
                session, user_id, limit, offset
            )

            result: list[ChatType] = []

            for item in enriched_chats:  # item: ChatListItemDTO
                chat = item.chat
                last_message = item.last_message
                message_sender = item.message_sender
                other_user = item.other_user
                other_user_profile = item.other_user_profile

                # Build last message preview
                last_message_preview = None
                if last_message:
                    last_message_preview = LastMessagePreview(
                        id=last_message.id,
                        content=last_message.content,
                        sent_at=last_message.sent_at,
                        sender_id=last_message.sender_id,
                        sender_email=(
                            message_sender.email if message_sender else None
                        ),
                        is_read=item.is_last_msg_read,
                    )

                # Build other user info (direct chats)
                other_user_info = None
                if other_user:
                    other_user_info = UserType(
                        id=other_user.id,
                        email=other_user.email,
                        created_at=other_user.created_at,
                    )

                # Determine image
                chat_kind = ChatKind(chat.type)
                if chat_kind == ChatKind.DIRECT and other_user_profile:
                    image_file_name = MinioService.form_link(MinioFolder.AVATARS, other_user_profile.avatar_pic_name)
                else:
                    image_file_name = MinioService.form_link(MinioFolder.CHAT_AVATARS,chat.image_file_name)

                result.append(
                    ChatType(
                        id=chat.id,
                        type=chat_kind,
                        title=chat.title,
                        image_file_name=image_file_name,
                        created_at=chat.created_at,
                        participants=[],  # Not needed for list view
                        last_message=last_message_preview,
                        has_unread_messages=item.has_unread,
                        unread_count=item.unread_count,
                        other_user=other_user_info,
                    )
                )

            return result

    @strawberry.field(
        description="Get messages in a chat with cursor-based pagination",
        permission_classes=[IsAuthenticated],
    )
    async def chat_messages(
        self, info, input: GetMessagesInput
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

            # Prepare next cursor
            next_cursor_sent_at = None
            next_cursor_id = None
            if has_more and messages:
                last_message = messages[-1]
                next_cursor_sent_at = last_message.sent_at
                next_cursor_id = last_message.id

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



import strawberry

from app.graphql.inputs.chat_inputs import (
    CreateChannelInput,
    CreateDirectChatInput,
    CreateGroupInput,
    DeleteChatInput,
    MarkAsReadInput,
    SendMessageInput,
)
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.chat import (
    ChatType,
    MarkAsReadResult,
    MessageSenderType,
    MessageType,
)
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.utils.database import Database


@strawberry.type
class ChatMutations:
    @strawberry.mutation(
        description="Send a message to a chat",
        permission_classes=[IsAuthenticated],
    )
    async def send_message(self, info, input: SendMessageInput) -> MessageType:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            message = await MessageService.send_message(
                session=session,
                sender_id=user_id,
                chat_id=input.chat_id,
                content=input.content,
            )


            return MessageType(
                id=message.id,
                chat_id=message.chat_id,
                sender=MessageSenderType(
                    id=message.sender.id,
                    email=message.sender.email,
                ),
                content=message.content,
                sent_at=message.sent_at,
            )

    @strawberry.mutation(
        description="Mark all messages in a chat as read",
        permission_classes=[IsAuthenticated],
    )
    async def mark_as_read(self, info, input: MarkAsReadInput) -> MarkAsReadResult:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            await ChatService.mark_as_read(
                session=session,
                chat_id=input.chat_id,
                user_id=user_id,
            )

            return MarkAsReadResult(success=True)

    @strawberry.mutation(
        description="Delete a chat (only host can delete channels/groups)",
        permission_classes=[IsAuthenticated],
    )
    async def delete_chat(self, info, input: DeleteChatInput) -> MarkAsReadResult:
        user_id = info.context.auth_context.user_id

        async with Database.get_session() as session:
            await ChatService.delete_chat(
                session=session,
                chat_id=input.chat_id,
                user_id=user_id,
            )

            return MarkAsReadResult(success=True)

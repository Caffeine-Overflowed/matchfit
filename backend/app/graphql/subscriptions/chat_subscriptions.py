from typing import AsyncGenerator

import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.chat import MessageSenderType, MessageType
from app.repositories.chat_repository import ChatRepository
from app.services.message_service import MessageService
from app.utils.database import Database


@strawberry.type
class ChatSubscriptions:
    @strawberry.subscription(
        description="Subscribe to new messages in a chat",
        permission_classes=[IsAuthenticated],
    )
    async def message_received(
        self,
        info: Info[GQLContext, None],
        chat_id: str,
    ) -> AsyncGenerator[MessageType, None]:
        user_id = info.context.auth_context.user_id

        # Verify user is a member of the chat
        async with Database.get_session() as session:
            is_member = await ChatRepository.is_user_member(session, chat_id, user_id)
            if not is_member:
                return

        async for data in MessageService.subscribe(chat_id, user_id):
            yield MessageType(
                id=data["id"],
                chat_id=data["chat_id"],
                sender=MessageSenderType(
                    id=data["sender_id"],
                    email=data["sender_email"] or "",
                ),
                content=data["content"],
                sent_at=data["sent_at"],
            )

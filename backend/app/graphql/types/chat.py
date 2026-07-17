from datetime import datetime
from typing import List, Optional

import strawberry
from strawberry.types import Info

from app.extensions.enums.chat_enums import ChatKind
from app.graphql.types.auth import UserType
from app.graphql.types.profile import ProfileType
from app.graphql.types.event_type import EventType
from app.utils.minio import MinioService, MinioFolder


@strawberry.type(description="Last message preview")
class LastMessagePreview:
    id: str = strawberry.field(description="Message ID")
    content: str = strawberry.field(description="Message content")
    sent_at: datetime = strawberry.field(description="When message was sent")
    sender_id: str = strawberry.field(description="Sender user ID")
    sender_email: Optional[str] = strawberry.field(description="Sender email")
    is_read: bool = strawberry.field(description="Whether message was read by current user")


@strawberry.type(description="Chat participant")
class ChatParticipantType:
    user_id: str = strawberry.field(description="User ID")
    is_host: bool = strawberry.field(description="Whether user is host")
    joined_at: datetime = strawberry.field(description="When user joined")
    last_read_message_id: Optional[str] = strawberry.field(
        description="ID of last read message"
    )


@strawberry.type(description="Chat")
class ChatType:
    id: str = strawberry.field(description="Chat ID")
    type: ChatKind = strawberry.field(description="Chat kind")
    title: Optional[str] = strawberry.field(description="Chat title")
    created_at: datetime = strawberry.field(description="When chat was created")
    participants: List[ChatParticipantType] = strawberry.field(
        description="Chat participants"
    )

    # Group/channel avatar object name; direct chats resolve the other user's avatar.
    _group_image: strawberry.Private[Optional[str]] = None
    # Last message from the list query (prefill); None + _has_prefill False -> load it.
    _last_message: strawberry.Private[Optional[object]] = None
    _has_prefill: strawberry.Private[bool] = False

    @strawberry.field(
        description="Chat image (group/channel avatar or the other user's avatar for direct chats)"
    )
    async def image_file_name(self, info: Info) -> Optional[str]:
        if ChatKind(self.type) == ChatKind.DIRECT:
            viewer_id = info.context.auth_context.user_id
            other = await info.context.other_user_loader.load(self.id, viewer_id)
            avatar = other[1] if other else None
            return MinioService.form_link(MinioFolder.AVATARS, avatar)
        return MinioService.form_link(MinioFolder.CHAT_AVATARS, self._group_image)

    @strawberry.field(description="Last message in chat (for chat list)")
    async def last_message(self, info: Info) -> Optional[LastMessagePreview]:
        message = (
            self._last_message
            if self._has_prefill
            else await info.context.last_message_loader.load(self.id)
        )
        if message is None:
            return None
        viewer_id = info.context.auth_context.user_id
        last_read = await info.context.read_state_loader.load(self.id, viewer_id)
        return LastMessagePreview(
            id=message.id,
            content=message.content,
            sent_at=message.sent_at,
            sender_id=message.sender_id,
            sender_email=message.sender.email if message.sender else None,
            is_read=last_read is not None and message.sent_at <= last_read,
        )

    @strawberry.field(description="Number of unread messages")
    async def unread_count(self, info: Info) -> int:
        viewer_id = info.context.auth_context.user_id
        return await info.context.unread_count_loader.load(self.id, viewer_id)

    @strawberry.field(description="Whether user has unread messages")
    async def has_unread_messages(self, info: Info) -> bool:
        viewer_id = info.context.auth_context.user_id
        return (await info.context.unread_count_loader.load(self.id, viewer_id)) > 0

    @strawberry.field(description="Other user info (for direct chats only)")
    async def other_user(self, info: Info) -> Optional[UserType]:
        if ChatKind(self.type) != ChatKind.DIRECT:
            return None
        viewer_id = info.context.auth_context.user_id
        other = await info.context.other_user_loader.load(self.id, viewer_id)
        if not other:
            return None
        user, _ = other
        return UserType(id=user.id, email=user.email, created_at=user.created_at)


@strawberry.type(description="Message sender info")
class MessageSenderType:
    id: str = strawberry.field(description="User ID")
    email: str = strawberry.field(description="User email")


@strawberry.type(description="Message")
class MessageType:
    id: str = strawberry.field(description="Message ID")
    chat_id: str = strawberry.field(description="Chat ID")
    sender: MessageSenderType = strawberry.field(description="Message sender")
    content: str = strawberry.field(description="Message content")
    sent_at: datetime = strawberry.field(description="When message was sent")


@strawberry.type(description="Paginated messages response")
class PaginatedMessagesType:
    messages: List[MessageType] = strawberry.field(description="List of messages")
    has_more: bool = strawberry.field(description="Whether there are more messages")
    next_cursor_sent_at: Optional[datetime] = strawberry.field(
        description="Cursor for next page: sent_at"
    )
    next_cursor_id: Optional[str] = strawberry.field(
        description="Cursor for next page: message ID"
    )


@strawberry.type(description="Mark as read result")
class MarkAsReadResult:
    success: bool = strawberry.field(description="Whether operation succeeded")


@strawberry.type(description="Detailed chat information")
class   ChatInfoType:
    id: str = strawberry.field(description="Chat ID")
    image_file_name: Optional[str] = strawberry.field(
        description="Chat image filename", default=None
    )
    type: ChatKind = strawberry.field(description="Chat kind")
    title: Optional[str] = strawberry.field(description="Chat name/title")
    is_deleted: bool = strawberry.field(description="Whether chat is deleted")
    event: Optional[EventType] = strawberry.field(
        description="Event associated with this chat (if any)",
        default=None
    )
    profile: Optional[ProfileType] = strawberry.field(
        description="Profile associated with this chat (if any)",
        default=None
    )
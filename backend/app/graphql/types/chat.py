from datetime import datetime
from typing import List, Optional

import strawberry

from app.extensions.enums.chat_enums import ChatKind
from app.graphql.types.auth import UserType
from app.graphql.types.profile import ProfileType
from app.graphql.types.event_type import EventType


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
    image_file_name: Optional[str] = strawberry.field(
        description="Chat image filename (chat avatar for groups/channels or user avatar for direct chats)",
        default=None
    )
    created_at: datetime = strawberry.field(description="When chat was created")
    participants: List[ChatParticipantType] = strawberry.field(
        description="Chat participants"
    )
    last_message: Optional[LastMessagePreview] = strawberry.field(
        description="Last message in chat (for chat list)", default=None
    )
    has_unread_messages: bool = strawberry.field(
        description="Whether user has unread messages", default=False
    )
    unread_count: int = strawberry.field(
        description="Number of unread messages", default=0
    )
    other_user: Optional[UserType] = strawberry.field(
        description="Other user info (for direct chats only)", default=None
    )


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
from datetime import datetime
from typing import List, Optional

import strawberry


@strawberry.input(description="Input for creating a direct chat")
class CreateDirectChatInput:
    other_user_id: str = strawberry.field(description="ID of the other user")


@strawberry.input(description="Input for creating a channel")
class CreateChannelInput:
    title: str = strawberry.field(description="Channel title")
    participant_ids: Optional[List[str]] = strawberry.field(
        default=None, description="List of participant user IDs"
    )


@strawberry.input(description="Input for creating a group")
class CreateGroupInput:
    title: str = strawberry.field(description="Group title")
    participant_ids: Optional[List[str]] = strawberry.field(
        default=None, description="List of participant user IDs"
    )


@strawberry.input(description="Input for sending a message")
class SendMessageInput:
    chat_id: str = strawberry.field(description="Chat ID")
    content: str = strawberry.field(description="Message content")


@strawberry.input(description="Input for fetching messages with pagination")
class GetMessagesInput:
    chat_id: str = strawberry.field(description="Chat ID")
    limit: Optional[int] = strawberry.field(
        default=50, description="Number of messages to fetch (max 100)"
    )
    cursor_sent_at: Optional[datetime] = strawberry.field(
        default=None, description="Cursor: sent_at timestamp of last message"
    )
    cursor_id: Optional[str] = strawberry.field(
        default=None, description="Cursor: ID of last message"
    )


@strawberry.input(description="Input for marking chat as read")
class MarkAsReadInput:
    chat_id: str = strawberry.field(description="Chat ID")


@strawberry.input(description="Input for deleting a chat")
class DeleteChatInput:
    chat_id: str = strawberry.field(description="Chat ID")

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID
from app.models import Chat, Message, Profile


@dataclass(slots=True)
class ChatDTO:
    id: UUID
    type: str
    title: Optional[str]
    image_file_name: Optional[str]
    created_at: datetime


@dataclass(slots=True)
class ChatInfoDTO:
    chat: Chat
    last_message: Message
    message_sender: Profile
    other_user: Profile
    other_user_profile: Profile
    has_unread: bool
    unread_count: int
    is_last_msg_read: bool


@dataclass(slots=True)
class MessageDTO:
    id: UUID
    content: str
    sent_at: datetime
    sender_id: UUID


@dataclass(slots=True)
class UserDTO:
    id: UUID
    email: str
    created_at: Optional[datetime] = None


@dataclass(slots=True)
class ProfileDTO:
    avatar_pic_name: Optional[str]


@dataclass(slots=True)
class ChatListItemDTO:
    chat: ChatDTO
    last_message: Optional[MessageDTO]
    message_sender: Optional[UserDTO]
    other_user: Optional[UserDTO]
    other_user_profile: Optional[ProfileDTO]

    has_unread: bool
    unread_count: int
    is_last_msg_read: bool




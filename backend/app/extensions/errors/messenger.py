from app.extensions.errors.base import BaseDomainError


class NotChatMemberError(BaseDomainError):
    """User is not a member of the chat."""

    CODE = "not_chat_member"


class ChatNotFoundError(BaseDomainError):
    """Chat not found."""

    CODE = "chat_not_found"


class UnauthorizedToSendError(BaseDomainError):
    """User is not authorized to send messages in this chat."""

    CODE = "unauthorized_to_send"


class DirectChatRequiresTwoUsersError(BaseDomainError):
    """Direct chat requires exactly two users."""

    CODE = "direct_chat_requires_two_users"


class MessageNotFoundError(BaseDomainError):
    """Message not found."""

    CODE = "message_not_found"


class CannotAddSelfToDirectChatError(BaseDomainError):
    """Cannot create direct chat with yourself."""

    CODE = "cannot_add_self_to_direct_chat"


class UnauthorizedToDeleteError(BaseDomainError):
    """User is not authorized to delete this chat (not the host)."""

    CODE = "unauthorized_to_delete"

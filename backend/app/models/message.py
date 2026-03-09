from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.utils.database import Base

if TYPE_CHECKING:
    from app.models.chat import Chat
    from app.models.user import User


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        # Composite index for efficient pagination
        Index("ix_messages_chat_sent_at", "chat_id", "sent_at"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    sender_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chat_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("chats.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    is_system: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Relationships
    sender: Mapped["User"] = relationship("User")
    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")

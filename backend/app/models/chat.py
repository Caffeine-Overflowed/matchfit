from datetime import UTC, datetime
from sqlalchemy import Enum
from typing import TYPE_CHECKING, List, Optional
from uuid import uuid4
from app.extensions.enums.chat_enums import ChatKind

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.utils.database import Base

if TYPE_CHECKING:
    from app.models.chat_participation import ChatParticipation
    from app.models.message import Message
    from app.models.user import User



class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    type: Mapped[ChatKind] = mapped_column(
        Enum(ChatKind, name="chat_type", native_enum=False),
        nullable=False,
        index=True,
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    is_deleted: Mapped[bool] = mapped_column(
        default=False, nullable=False
    )
    image_file_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )

    # Relationships
    participants: Mapped[List["ChatParticipation"]] = relationship(
        "ChatParticipation", back_populates="chat", cascade="all, delete-orphan"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan"
    )
    event = relationship(
        "Event",
        back_populates="chat",
        uselist=False,
    )
    match = relationship(
        "Match",
        back_populates="chat",
        uselist=False,
    )



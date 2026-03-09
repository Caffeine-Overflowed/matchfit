from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.utils.database import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    target_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    chat_id: Mapped[str] = mapped_column(String(36), ForeignKey("chats.id"), nullable=True)
    is_match: Mapped[bool] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_swipe_user_id", "user_id"),
        Index("idx_swipe_target_id", "target_id"),
    )

    chat = relationship(
        "Chat",
        back_populates="match",
        uselist=False,
    )

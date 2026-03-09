from datetime import datetime
from typing import Optional, Any
from uuid import uuid4

from sqlalchemy import String, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.utils.database import Base
from app.extensions.enums.notification_enums import NotificationType


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[NotificationType] = mapped_column(nullable=False)

    # JSONB для расширяемых данных
    # Примеры payload:
    # NEW_MATCH: {"event_id": "...", "matched_user_id": "..."}
    # EVENT_STATUS_CHANGED: {"event_id": "...", "old_status": "SCHEDULED", "new_status": "CANCELLED"}
    # NEW_REVIEW: {"review_id": "...", "reviewer_id": "...", "event_id": "..."}
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index(
            "ix_notifications_user_created",
            "user_id",
            "created_at",
            postgresql_using="btree",
        ),
        Index(
            "ix_notifications_user_unread",
            "user_id",
            "read_at",
            postgresql_where="read_at IS NULL",
        ),
    )

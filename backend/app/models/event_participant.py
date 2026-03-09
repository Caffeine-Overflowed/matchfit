from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, func, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.utils.database import Base
from app.extensions.enums.event_enums import ParticipantRole, ParticipantStatus


class EventParticipant(Base):
    __tablename__ = "event_participants"

    event_id: Mapped[str] = mapped_column(String(36), ForeignKey("events.id"), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), primary_key=True)

    role: Mapped[ParticipantRole] = mapped_column(default=ParticipantRole.MEMBER)
    status: Mapped[ParticipantStatus] = mapped_column(default=ParticipantStatus.ACTIVE)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    event: Mapped["Event"] = relationship("Event", back_populates="participants")
    user: Mapped["User"] = relationship("User")

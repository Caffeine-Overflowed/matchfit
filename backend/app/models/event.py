from datetime import datetime
from typing import Optional, List
from uuid import uuid4

from geoalchemy2 import Geography
from sqlalchemy import String, DateTime, Integer, Text, ForeignKey, Table, Column, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.utils.database import Base
from app.extensions.enums.event_enums import EventPrivacy, EventCategory, EventStatus, DifficultyLevel


# Association table for Event <-> Sport (many-to-many)
event_sports = Table(
    "event_sports",
    Base.metadata,
    Column("event_id", String(36), ForeignKey("events.id"), primary_key=True),
    Column("sport_id", Integer, ForeignKey("sports.id"), primary_key=True),
)



class Event(Base):
    __tablename__ = "events"
    __table_args__ = (
        Index("ix_events_location", "location", postgresql_using="gist"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    host_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    # Основная информация
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[EventCategory] = mapped_column(default=EventCategory.TRIP)
    image_file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Время
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Локация
    location: Mapped[str] = mapped_column(
        Geography(geometry_type='POINT', srid=4326), nullable=False
    )

    # Участники
    target_participants: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_participants: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Детали
    difficulty: Mapped[DifficultyLevel] = mapped_column(default=DifficultyLevel.N_A)

    # Доступ
    privacy: Mapped[EventPrivacy] = mapped_column(default=EventPrivacy.PUBLIC)

    # Статус и метаданные
    status: Mapped[EventStatus] = mapped_column(default=EventStatus.SCHEDULED)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Optional chat for event
    chat_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("chats.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    chat = relationship("Chat", foreign_keys=[chat_id], lazy="selectin")
    host = relationship("User", back_populates="events", lazy="selectin")
    sports: Mapped[List["Sport"]] = relationship(
        "Sport", secondary=event_sports, back_populates="events", lazy="selectin"
    )
    participants: Mapped[List["EventParticipant"]] = relationship(
        "EventParticipant", back_populates="event", cascade="all, delete-orphan", lazy="selectin"
    )

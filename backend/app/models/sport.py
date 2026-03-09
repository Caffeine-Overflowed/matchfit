from typing import List

from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.utils.database import Base



class Sport(Base):
    __tablename__ = "sports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon_url: Mapped[str] = mapped_column(Text, nullable=False)

    events: Mapped[List["Event"]] = relationship(
        "Event", secondary="event_sports", back_populates="sports"
    )

    profiles: Mapped[List["Profile"]] = relationship(
        "Profile", secondary="profile_sports", back_populates="sports"
    )
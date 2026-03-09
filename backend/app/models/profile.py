from datetime import datetime, UTC, date
from typing import List, Optional

from geoalchemy2 import Geography
from sqlalchemy import String, DateTime, Float, Column, ForeignKey, Table, Index, Date, Enum
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions.enums.profile_enums import Chronotype
from app.utils.database import Base

profile_goals = Table(
    "profile_goals",
    Base.metadata,
    Column("profile_id", ForeignKey("profiles.user_id"), primary_key=True),
    Column("goal_id", ForeignKey("goals.id"), primary_key=True),
)

profile_sports = Table(
    "profile_sports",
    Base.metadata,
    Column("profile_id", ForeignKey("profiles.user_id"), primary_key=True),
    Column("sport_id", ForeignKey("sports.id"), primary_key=True),
)


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = (
        Index("ix_profiles_location", "location", postgresql_using="gist"),
    )

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    avatar_pic_name: Mapped[str] = mapped_column(String(500), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    birthdate: Mapped[date] = mapped_column(Date, nullable=False)

    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    gender: Mapped[str] = mapped_column(String(50), nullable=False)
    bio: Mapped[str] = mapped_column(String(500), nullable=False, server_default="")
    chronotype: Mapped[Chronotype] = mapped_column(Enum(Chronotype, name="chronotype", native_enum=False),
                                                   nullable=False)
    languages: Mapped[list[str]] = mapped_column(
        postgresql.ARRAY(String(5)), nullable=False, server_default="{}"
    )
    location: Mapped[Optional[str]] = mapped_column(
        Geography(geometry_type='POINT', srid=4326), nullable=True
    )
    location_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    goals: Mapped[List["Goal"]] = relationship(
        "Goal", secondary=profile_goals, back_populates="profiles"
    )

    sports: Mapped[List["Sport"]] = relationship(
        "Sport", secondary=profile_sports, back_populates="profiles"
    )

    @property
    def age(self) -> int:
        today = date.today()
        age = today.year - self.birthdate.year
        birthday_has_passed = (today.month, today.day) >= (self.birthdate.month, self.birthdate.day)
        return age if birthday_has_passed else age - 1

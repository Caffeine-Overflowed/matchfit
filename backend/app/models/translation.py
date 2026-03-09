from sqlalchemy import String, Text, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.utils.database import Base


class Translation(Base):
    """
    Универсальная таблица переводов для всех сущностей в системе.

    Примеры использования:
    - entity_type="notification_type", key="NEW_MATCH", locale="ru"
      -> "У вас новый матч на событие \"{event_title}\""
    - entity_type="notification_title", key="NEW_MATCH", locale="ru"
      -> "Новый матч!"
    - entity_type="sport", key="FOOTBALL", locale="ru" -> "Футбол"
    - entity_type="event_category", key="TRIP", locale="en" -> "Trip"
    - entity_type="difficulty_level", key="HARD", locale="ru" -> "Сложный"
    """

    __tablename__ = "translations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Тип сущности (notification_type, notification_title, sport, event_category, etc.)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Ключ (значение enum или идентификатор)
    key: Mapped[str] = mapped_column(String(100), nullable=False)

    # Локаль (ru, en, kz, etc.)
    locale: Mapped[str] = mapped_column(String(10), nullable=False)

    # Текст перевода (может содержать плейсхолдеры: {event_title}, {user_name})
    value: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "entity_type", "key", "locale", name="uq_translation_entity_key_locale"
        ),
        Index("ix_translations_entity_key", "entity_type", "key"),
    )

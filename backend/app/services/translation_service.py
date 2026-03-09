import re
from typing import Optional, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.translation_repository import TranslationRepository
from app.models.notification import Notification


class TranslationService:
    """Сервис локализации."""

    _PLACEHOLDER_REGEX = re.compile(r"\{(\w+)\}")

    DEFAULT_LOCALE = "ru"
    FALLBACK_LOCALE = "en"

    # In-memory cache: {(entity_type, key, locale): value}
    _cache: dict[tuple[str, str, str], str] = {}
    _cache_loaded: set[str] = set()  # entity_types that are fully loaded

    @classmethod
    async def get_translation(
        cls,
        session: AsyncSession,
        entity_type: str,
        key: str,
        locale: Optional[str] = None,
    ) -> Optional[str]:
        """Получение перевода с fallback."""
        locale = locale or cls.DEFAULT_LOCALE
        return await TranslationRepository.get_with_fallback(
            session, entity_type, key, locale, cls.FALLBACK_LOCALE
        )

    @classmethod
    async def format_notification_text(
        cls,
        session: AsyncSession,
        notification: Notification,
        locale: Optional[str] = None,
    ) -> str:
        """
        Форматирование текста уведомления с подстановкой данных из payload.

        Пример:
        - Template: "У вас новый матч на событие \"{event_title}\""
        - Payload: {"event_title": "Футбол в парке"}
        - Result: "У вас новый матч на событие \"Футбол в парке\""
        """
        locale = locale or cls.DEFAULT_LOCALE

        template = await cls.get_translation(
            session,
            entity_type="notification_type",
            key=notification.type.value,
            locale=locale,
        )

        if not template:
            return notification.type.value

        return cls._format_template(template, notification.payload)

    @classmethod
    async def get_notification_title(
        cls,
        session: AsyncSession,
        notification: Notification,
        locale: Optional[str] = None,
    ) -> str:
        """Получение заголовка уведомления."""
        locale = locale or cls.DEFAULT_LOCALE

        title = await cls.get_translation(
            session,
            entity_type="notification_title",
            key=notification.type.value,
            locale=locale,
        )

        return title or notification.type.value

    @classmethod
    async def get_notifications_localized(
        cls,
        session: AsyncSession,
        notifications: list[Notification],
        locale: Optional[str] = None,
    ) -> list[tuple[str, str]]:
        """
        Batch-загрузка локализованных title и text для списка уведомлений.
        Возвращает list[(title, text)] в том же порядке что и notifications.
        """
        if not notifications:
            return []

        locale = locale or cls.DEFAULT_LOCALE

        # Собираем уникальные типы уведомлений
        unique_types = list({n.type.value for n in notifications})

        # Загружаем все переводы за 2 запроса вместо 2*N
        titles_map = await TranslationRepository.get_batch(
            session, "notification_title", unique_types, locale
        )
        texts_map = await TranslationRepository.get_batch(
            session, "notification_type", unique_types, locale
        )

        # Fallback на английский если нужно
        missing_title_keys = [k for k in unique_types if k not in titles_map]
        missing_text_keys = [k for k in unique_types if k not in texts_map]

        if missing_title_keys and locale != cls.FALLBACK_LOCALE:
            fallback_titles = await TranslationRepository.get_batch(
                session, "notification_title", missing_title_keys, cls.FALLBACK_LOCALE
            )
            titles_map.update(fallback_titles)

        if missing_text_keys and locale != cls.FALLBACK_LOCALE:
            fallback_texts = await TranslationRepository.get_batch(
                session, "notification_type", missing_text_keys, cls.FALLBACK_LOCALE
            )
            texts_map.update(fallback_texts)

        # Формируем результат
        result = []
        for n in notifications:
            type_key = n.type.value
            title = titles_map.get(type_key, type_key)
            text_template = texts_map.get(type_key)
            text = (
                cls._format_template(text_template, n.payload)
                if text_template
                else type_key
            )
            result.append((title, text))

        return result

    @classmethod
    def _format_template(cls, template: str, data: dict[str, Any]) -> str:
        """Подстановка значений в шаблон."""

        def replacer(match: re.Match) -> str:
            key = match.group(1)
            return str(data.get(key, match.group(0)))

        return cls._PLACEHOLDER_REGEX.sub(replacer, template)

    # -------------------------------------------------------------------------
    # Cache methods
    # -------------------------------------------------------------------------

    @classmethod
    async def preload_cache(cls, session: AsyncSession, entity_type: str) -> None:
        """Загрузка всех переводов entity_type в кэш."""
        if entity_type in cls._cache_loaded:
            return

        translations = await TranslationRepository.get_all_by_entity_type(
            session, entity_type
        )

        for t in translations:
            cls._cache[(t.entity_type, t.key, t.locale)] = t.value

        cls._cache_loaded.add(entity_type)

    @classmethod
    async def ensure_notification_cache(cls, session: AsyncSession) -> None:
        """Загрузка кэша переводов для уведомлений."""
        await cls.preload_cache(session, "notification_type")
        await cls.preload_cache(session, "notification_title")

    @classmethod
    def get_cached(
        cls,
        entity_type: str,
        key: str,
        locale: Optional[str] = None,
    ) -> Optional[str]:
        """Получение перевода из кэша (без fallback)."""
        locale = locale or cls.DEFAULT_LOCALE
        return cls._cache.get((entity_type, key, locale))

    @classmethod
    def get_cached_with_fallback(
        cls,
        entity_type: str,
        key: str,
        locale: Optional[str] = None,
    ) -> Optional[str]:
        """Получение перевода из кэша с fallback на FALLBACK_LOCALE."""
        locale = locale or cls.DEFAULT_LOCALE

        value = cls._cache.get((entity_type, key, locale))
        if value:
            return value

        if locale != cls.FALLBACK_LOCALE:
            return cls._cache.get((entity_type, key, cls.FALLBACK_LOCALE))

        return None

    @classmethod
    def format_notification_cached(
        cls,
        notification_type: str,
        payload: dict[str, Any],
        locale: Optional[str] = None,
    ) -> tuple[str, str]:
        """
        Форматирование title и text уведомления из кэша.
        Возвращает (title, text). Если кэш пуст - возвращает notification_type.
        """
        locale = locale or cls.DEFAULT_LOCALE

        title = cls.get_cached_with_fallback(
            "notification_title", notification_type, locale
        )
        text_template = cls.get_cached_with_fallback(
            "notification_type", notification_type, locale
        )

        title = title or notification_type
        text = (
            cls._format_template(text_template, payload)
            if text_template
            else notification_type
        )

        return title, text

    @classmethod
    def clear_cache(cls) -> None:
        """Очистка кэша (для тестов или при обновлении переводов)."""
        cls._cache.clear()
        cls._cache_loaded.clear()

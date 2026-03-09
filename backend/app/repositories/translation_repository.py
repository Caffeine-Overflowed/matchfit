from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.translation import Translation


class TranslationRepository:
    @staticmethod
    async def get(
        session: AsyncSession,
        entity_type: str,
        key: str,
        locale: str,
    ) -> Optional[str]:
        result = await session.execute(
            select(Translation.value)
            .where(Translation.entity_type == entity_type)
            .where(Translation.key == key)
            .where(Translation.locale == locale)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_with_fallback(
        session: AsyncSession,
        entity_type: str,
        key: str,
        locale: str,
        fallback_locale: str = "en",
    ) -> Optional[str]:
        value = await TranslationRepository.get(session, entity_type, key, locale)
        if value is None and locale != fallback_locale:
            value = await TranslationRepository.get(
                session, entity_type, key, fallback_locale
            )
        return value

    @staticmethod
    async def get_batch(
        session: AsyncSession,
        entity_type: str,
        keys: list[str],
        locale: str,
    ) -> dict[str, str]:
        result = await session.execute(
            select(Translation.key, Translation.value)
            .where(Translation.entity_type == entity_type)
            .where(Translation.key.in_(keys))
            .where(Translation.locale == locale)
        )
        return {row.key: row.value for row in result.all()}

    @staticmethod
    async def get_all_for_entity_type(
        session: AsyncSession,
        entity_type: str,
        locale: str,
    ) -> dict[str, str]:
        result = await session.execute(
            select(Translation.key, Translation.value)
            .where(Translation.entity_type == entity_type)
            .where(Translation.locale == locale)
        )
        return {row.key: row.value for row in result.all()}

    @staticmethod
    async def get_all_by_entity_type(
        session: AsyncSession,
        entity_type: str,
    ) -> list[Translation]:
        """Получение всех переводов для entity_type (все локали)."""
        result = await session.execute(
            select(Translation).where(Translation.entity_type == entity_type)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create(
        session: AsyncSession,
        entity_type: str,
        key: str,
        locale: str,
        value: str,
    ) -> Translation:
        translation = Translation(
            entity_type=entity_type,
            key=key,
            locale=locale,
            value=value,
        )
        session.add(translation)
        await session.flush()
        return translation

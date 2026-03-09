from strawberry.dataloader import DataLoader
from sqlalchemy import select

from app.models.event_participant import EventParticipant
from app.utils.database import Database


class EventParticipationLoader:
    """DataLoader для batch-проверки участия пользователя в событии."""

    def __init__(self):
        self._loader = DataLoader(load_fn=self._load_participations)

    async def _load_participations(
        self, keys: list[tuple[str, str]]
    ) -> list[bool]:
        """Проверяет участие для списка (event_id, user_id) пар.

        Каждый batch получает свою изолированную сессию.
        """
        if not keys:
            return []

        async with Database.get_session() as session:
            # Собираем уникальные пары для запроса
            result = await session.execute(
                select(EventParticipant.event_id, EventParticipant.user_id)
                .where(
                    EventParticipant.event_id.in_([k[0] for k in keys]),
                    EventParticipant.user_id.in_([k[1] for k in keys]),
                )
            )

            # Создаём set существующих пар для O(1) lookup
            existing_pairs = {(row[0], row[1]) for row in result.all()}

            # Возвращаем в том же порядке, что и keys
            return [key in existing_pairs for key in keys]

    async def load(self, key: tuple[str, str]) -> bool:
        """Проверяет участие (event_id, user_id) с батчингом."""
        return await self._loader.load(key)

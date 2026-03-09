from strawberry.dataloader import DataLoader
from sqlalchemy import select, func

from app.models.event_participant import EventParticipant
from app.utils.database import Database


class EventParticipantsCountLoader:
    """DataLoader для batch-загрузки количества участников событий."""

    def __init__(self):
        self._loader = DataLoader(load_fn=self._load_counts)

    async def _load_counts(self, event_ids: list[str]) -> list[int]:
        """Загружает количество участников для списка event_id."""
        if not event_ids:
            return []

        async with Database.get_session() as session:
            result = await session.execute(
                select(
                    EventParticipant.event_id,
                    func.count(EventParticipant.user_id).label("count")
                )
                .where(EventParticipant.event_id.in_(event_ids))
                .group_by(EventParticipant.event_id)
            )

            counts = {row[0]: row[1] for row in result.all()}

            # Возвращаем в том же порядке, что и event_ids (0 если нет участников)
            return [counts.get(eid, 0) for eid in event_ids]

    async def load(self, event_id: str) -> int:
        """Загружает количество участников события с батчингом."""
        return await self._loader.load(event_id)

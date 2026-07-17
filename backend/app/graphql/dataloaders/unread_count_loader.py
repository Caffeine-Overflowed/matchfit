from strawberry.dataloader import DataLoader

from app.repositories.chat_repository import ChatRepository
from app.utils.database import Database


class UnreadCountLoader:
    """DataLoader для batch-загрузки числа непрочитанных по (chat_id, viewer_id)."""

    def __init__(self):
        self._loader = DataLoader(load_fn=self._load)

    async def _load(self, keys: list[tuple[str, str]]) -> list[int]:
        by_user: dict[str, list[str]] = {}
        for chat_id, user_id in keys:
            by_user.setdefault(user_id, []).append(chat_id)
        result: dict[tuple[str, str], int] = {}
        async with Database.get_session() as session:
            for user_id, chat_ids in by_user.items():
                counts = await ChatRepository.get_unread_counts(session, chat_ids, user_id)
                for chat_id in chat_ids:
                    result[(chat_id, user_id)] = counts.get(chat_id, 0)
        return [result.get(key, 0) for key in keys]

    async def load(self, chat_id: str, user_id: str) -> int:
        return await self._loader.load((chat_id, user_id))

from typing import Optional

from strawberry.dataloader import DataLoader

from app.models.message import Message
from app.repositories.chat_repository import ChatRepository
from app.utils.database import Database


class LastMessageLoader:
    """DataLoader для batch-загрузки последнего сообщения по chat_id."""

    def __init__(self):
        self._loader = DataLoader(load_fn=self._load)

    async def _load(self, chat_ids: list[str]) -> list[Optional[Message]]:
        async with Database.get_session() as session:
            by_chat = await ChatRepository.get_last_messages(session, chat_ids)
            return [by_chat.get(chat_id) for chat_id in chat_ids]

    async def load(self, chat_id: str) -> Optional[Message]:
        return await self._loader.load(chat_id)

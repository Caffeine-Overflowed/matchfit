from typing import Optional
from strawberry.dataloader import DataLoader

from app.models.profile import Profile
from app.services.profile_service import ProfileService
from app.utils.database import Database


class ProfileLoader:
    """DataLoader для batch-загрузки профилей по user_id."""

    def __init__(self):
        self._loader = DataLoader(load_fn=self._load_profiles)

    async def _load_profiles(self, user_ids: list[str]) -> list[Optional[Profile]]:
        """Загружает профили для списка user_id через Service.

        Каждый batch получает свою изолированную сессию,
        что исключает race conditions между concurrent запросами.
        """
        async with Database.get_session() as session:
            profiles = await ProfileService.get_profiles_by_ids(session, user_ids)
            return [profiles.get(uid) for uid in user_ids]

    async def load(self, user_id: str) -> Optional[Profile]:
        """Загружает профиль по user_id (с батчингом)."""
        return await self._loader.load(user_id)

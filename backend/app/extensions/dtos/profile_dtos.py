from dataclasses import dataclass
from typing import Optional

from app.models.profile import Profile


@dataclass(slots=True)
class ProfileWithDistanceDTO:
    """DTO для профиля с расстоянием до пользователя."""
    profile: Profile
    distance_km: Optional[int] = None

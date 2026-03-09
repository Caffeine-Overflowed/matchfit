from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING

import strawberry
from datetime import datetime

from app.extensions.enums.profile_enums import Chronotype
from app.graphql.types.goal import GoalType
from app.graphql.types.sport import SportType
from app.services.profile_service import ProfileService

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.extensions.dtos.profile_dtos import ProfileWithDistanceDTO


@strawberry.type(description="Профиль пользователя")
class ProfileType:
    user_id: str = strawberry.field(description="ID пользователя (UUID)")
    name: str = strawberry.field(description="Имя пользователя")
    age: int = strawberry.field(description="Возраст пользователя (лет)")
    avatar_url: str = strawberry.field(description="URL аватара")
    gender: str = strawberry.field(description="Пол")
    weight: Optional[float] = strawberry.field(description="Вес пользователя (кг)")
    height: Optional[float] = strawberry.field(description="Рост пользователя (см)")
    bio: str = strawberry.field(description="О себе")
    languages: List[str] = strawberry.field(description="Языки (ISO 639-1 коды)")
    updated_at: datetime = strawberry.field(description="Дата последнего обновления")
    goals: List[GoalType] = strawberry.field(description="цели пользователя")
    sports: List[SportType] = strawberry.field(description="спорты пользователя")
    distance: Optional[int] = strawberry.field(description="Расстояние до пользователя (км)", default=None)
    location_name: Optional[str] = strawberry.field(description="Название локации (город/страна)", default=None)
    chronotype: Chronotype = strawberry.field(description="Хронотипы")

    @classmethod
    def from_model(cls, profile: Profile) -> ProfileType:
        """Маппинг Profile модели в GraphQL тип."""
        return cls(
            user_id=profile.user_id,
            name=profile.name,
            age=profile.age,
            avatar_url=ProfileService.get_avatar_url(profile),
            weight=profile.weight,
            height=profile.height,
            bio=profile.bio,
            languages=profile.languages or [],
            gender=profile.gender,
            updated_at=profile.updated_at,
            goals=[GoalType(id=g.id, name=g.name, icon_url=g.icon_url, description=g.description) for g in profile.goals],
            sports=[SportType(id=s.id, name=s.name, icon_url=s.icon_url) for s in profile.sports],
            location_name=profile.location_name,
            chronotype=profile.chronotype,
        )

    @classmethod
    def from_dto(cls, dto: ProfileWithDistanceDTO) -> ProfileType:
        """Маппинг ProfileWithDistanceDTO в GraphQL тип."""
        profile = dto.profile
        return cls(
            user_id=profile.user_id,
            name=profile.name,
            age=profile.age,
            avatar_url=ProfileService.get_avatar_url(profile),
            weight=profile.weight,
            height=profile.height,
            bio=profile.bio,
            languages=profile.languages or [],
            gender=profile.gender,
            updated_at=profile.updated_at,
            goals=[GoalType(id=g.id, name=g.name, icon_url=g.icon_url, description=g.description) for g in profile.goals],
            sports=[SportType(id=s.id, name=s.name, icon_url=s.icon_url) for s in profile.sports],
            distance=dto.distance_km,
            location_name=profile.location_name,
            chronotype=profile.chronotype,
        )

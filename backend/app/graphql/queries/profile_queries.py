from typing import Optional

import strawberry
from strawberry import Info

from app.graphql.inputs.profile_inputs import ProfileFilterInput

from app.graphql.context.context import GQLContext
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.profile import ProfileType
from app.utils.database import Database
from app.services.profile_service import ProfileService


@strawberry.type
class ProfileQueries:
    @strawberry.field(description="Получить профиль пользователя", permission_classes=[IsAuthenticated])
    async def profile(self, user_id: str) -> ProfileType:
        async with Database.get_session() as session:
            profile = await ProfileService.get_profile_by_id(session, user_id)
            return ProfileType.from_model(profile)

    @strawberry.field(description="Получить свой профиль", permission_classes=[IsAuthenticated])
    async def my_profile(self, info: Info[GQLContext, None]) -> Optional[ProfileType]:
        async with Database.get_session() as session:
            profile = await ProfileService.get_my_profile(
                session, info.context.auth_context.user_id
            )
            return ProfileType.from_model(profile) if profile else None

    @strawberry.field(description="Подобрать похожие профили", permission_classes=[IsAuthenticated])
    async def similar_profiles(
        self,
        info: Info[GQLContext, None],
        filters: ProfileFilterInput,
        limit: int = 20,
        offset: int = 0
    ) -> list[ProfileType]:
        async with Database.get_session() as session:
            dtos = await ProfileService.get_similar_profiles(
                session,
                info.context.auth_context.user_id,
                filters,
                limit,
                offset
            )
            return [ProfileType.from_dto(dto) for dto in dtos]

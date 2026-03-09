import strawberry

from app.graphql.context.context import GQLContext
from app.graphql.inputs.profile_inputs import ProfileInput, UpdateLocationInput
from app.graphql.permissions.is_authenticated import IsAuthenticated
from app.graphql.types.profile import ProfileType
from app.services.profile_service import ProfileService
from app.utils.database import Database



@strawberry.type
class ProfileMutations:
    @strawberry.mutation(description="Создание профиля при онбординге", permission_classes=[IsAuthenticated])
    async def create_profile(
        self,
        info: strawberry.Info[GQLContext],
        data: ProfileInput
    ) -> ProfileType:
        async with Database.get_session() as session:
            profile = await ProfileService.setup_profile(
                session, info.context.auth_context.user_id, data
            )
            return ProfileType.from_model(profile)

    @strawberry.mutation(description="Изменение профиля", permission_classes=[IsAuthenticated])
    async def update_profile(
        self,
        info: strawberry.Info[GQLContext],
        data: ProfileInput
    ) -> ProfileType:
        async with Database.get_session() as session:
            profile = await ProfileService.update_profile(
                session, info.context.auth_context.user_id, data
            )
            return ProfileType.from_model(profile)

    @strawberry.mutation(description="Обновление только локации профиля", permission_classes=[IsAuthenticated])
    async def update_location(
        self,
        info: strawberry.Info[GQLContext],
        data: UpdateLocationInput
    ) -> ProfileType:
        async with Database.get_session() as session:
            profile = await ProfileService.update_location(
                session, 
                user_id=info.context.auth_context.user_id,
                lat=data.lat,
                lon=data.lon
            )
            return ProfileType.from_model(profile)

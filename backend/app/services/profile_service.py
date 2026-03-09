from datetime import date
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.dtos.profile_dtos import ProfileWithDistanceDTO
from app.extensions.enums.profile_enums import Chronotype
from app.extensions.errors.profile import OnboardingAlreadyCompletedError, ProfileNotFoundError, NotOnboardedError
from app.graphql.inputs.profile_inputs import ProfileInput, ProfileFilterInput
from app.models import Sport
from app.models.goal import Goal
from app.models.profile import Profile
from app.repositories.goal_repository import GoalRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.sport_repository import SportRepository
from app.utils.geo import make_point
from app.utils.minio import MinioService, MinioFolder
from app.services.redis_service import RedisService
from app.repositories.match_repository import MatchRepository
from app.utils.observability import get_logger
from app.utils.validators import validate_bio, validate_languages
from app.services.geo_service import GeoService

log = get_logger()

class ProfileService:
    @staticmethod
    def get_avatar_url(profile: Profile) -> str:
        """Возвращает URL аватара профиля."""
        if not profile.avatar_pic_name:
             # Fallback logic if needed, or raise error.
             # Given DB constraint, should be fine. But let's return empty string or specific error if broken.
             # Actually user said "make it not optional". So we assume it exists.
             return ""
        return MinioService.form_link(MinioFolder.AVATARS, profile.avatar_pic_name)

    @staticmethod
    async def get_profile_by_id(
            session: AsyncSession,
            user_id: str,
    ) -> Profile:
        """Получение профиля по ID. Выбрасывает ProfileNotFoundError если не найден."""
        profile = await ProfileRepository.get_by_user_id(session, user_id)

        if not profile:
            raise ProfileNotFoundError()


        return profile

    @staticmethod
    async def get_profile_or_none(
            session: AsyncSession,
            user_id: str,
    ) -> Profile | None:
        """Получение профиля по ID. Возвращает None если не найден."""
        return await ProfileRepository.get_by_user_id(session, user_id)

    @staticmethod
    async def get_profiles_by_ids(
            session: AsyncSession,
            user_ids: Sequence[str],
    ) -> dict[str, Profile]:
        """Batch-загрузка профилей по списку user_id."""
        return await ProfileRepository.get_by_user_ids(session, user_ids)

    @staticmethod
    async def get_my_profile(
            session: AsyncSession,
            user_id: str,
    ) -> Optional[Profile]:
        profile = await ProfileRepository.get_by_user_id(session, user_id)

        if not profile:
            return None

        return profile

    @staticmethod
    async def setup_profile(
            session: AsyncSession,
            user_id: str,
            data: ProfileInput
    ) -> Profile:
        log.debug(f"profile.setup.started", user_id=user_id)
        # check
        existing_profile = await ProfileRepository.get_by_user_id(session, user_id)
        if existing_profile:
            log.debug(f"profile.setup.already_completed", user_id=user_id)
            raise OnboardingAlreadyCompletedError()
        log.debug(f"profile.setup.creating", user_id=user_id)

        # avatar
        log.debug(f"profile.setup.downloading_avatar", user_id=user_id)
        content = await data.avatar.read()
        avatar_name = MinioService.form_avatar_name(data.avatar, user_id)
        log.debug(f"profile.setup.downloaded_avatar", user_id=user_id, avatar_name=avatar_name)

        log.debug(f"profile.setup.uploading_avatar", user_id=user_id, avatar_name=avatar_name)
        await MinioService.upload_object(
            folder=MinioFolder.AVATARS,
            object_name=avatar_name,
            file=content
        )
        log.debug(f"profile.setup.uploaded_avatar", user_id=user_id, avatar_name=avatar_name)

        # sport and goals
        sports = await SportRepository.get_by_ids(session, data.sport_ids)
        goals = await GoalRepository.get_by_ids(session, data.goal_ids)

        # set birthdate to 15th of birth month
        birth_date_value = date(year=data.birth_year, month=data.birth_month, day=15)

        # location and location_name
        location = make_point(data.lat, data.lon) if data.lat is not None and data.lon is not None else None
        location_name = None
        if data.lat is not None and data.lon is not None:
            location_name = await GeoService.get_location_name(data.lat, data.lon)

        # bio and languages validation
        bio = validate_bio(data.bio)
        languages = validate_languages(data.languages)

        new_profile = Profile(
            user_id=user_id,
            name=data.name,
            birthdate=birth_date_value,
            weight=data.weight,
            height=data.height,
            gender=data.gender,
            bio=bio,
            languages=languages,
            location=location,
            location_name=location_name,
            avatar_pic_name=avatar_name,
            sports=sports,
            goals=goals,
            chronotype=data.chronotype,
        )

        await ProfileRepository.create(session, new_profile)

        return new_profile

    @staticmethod
    async def update_profile(
            session: AsyncSession,
            user_id: str,
            data: ProfileInput
    ) -> Profile:

        # check
        existing_profile = await ProfileRepository.get_by_user_id(session, user_id)
        if not existing_profile:
            raise ProfileNotFoundError()

        # avatar
        content = await data.avatar.read()
        avatar_name = MinioService.form_avatar_name(data.avatar, user_id)
        try:
            await MinioService.delete_object(
                folder=MinioFolder.AVATARS,
                object_name=existing_profile.avatar_pic_name
            )
        except Exception as e:
            log.error(f"Failed to delete old avatar: {e}", user_id=user_id, old_avatar_name=existing_profile.avatar_pic_name)
        await MinioService.upload_object(
            folder=MinioFolder.AVATARS,
            object_name=avatar_name,
            file=content
        )

        # sport and goals
        sports = await SportRepository.get_by_ids(session, data.sport_ids)
        goals = await GoalRepository.get_by_ids(session, data.goal_ids)

        # set birthdate to 15th of birth month
        birth_date_value = date(year=data.birth_year, month=data.birth_month, day=15)

        # location and location_name
        location = make_point(data.lat, data.lon) if data.lat is not None and data.lon is not None else None
        location_name = None
        if data.lat is not None and data.lon is not None:
            location_name = await GeoService.get_location_name(data.lat, data.lon)

        # bio and languages validation
        bio = validate_bio(data.bio)
        languages = validate_languages(data.languages)

        update_fields = {
            "name": data.name,
            "birthdate": birth_date_value,
            "weight": data.weight,
            "height": data.height,
            "gender": data.gender,
            "bio": bio,
            "languages": languages,
            "location": location,
            "location_name": location_name,
            "avatar_pic_name": avatar_name,
            "sports": sports,  # Объекты из базы
            "goals": goals,  # Объекты из базы
            "chronotype": data.chronotype,
        }

        await ProfileRepository.update(session, update_fields, existing_profile)

        return existing_profile

    @staticmethod
    async def update_location(
            session: AsyncSession,
            user_id: str,
            lat: float,
            lon: float
    ) -> Profile:
        """Обновление только локации профиля."""
        
        # Check if profile exists
        existing_profile = await ProfileRepository.get_by_user_id(session, user_id)
        if not existing_profile:
             raise ProfileNotFoundError()

        location = make_point(lat, lon)
        location_name = await GeoService.get_location_name(lat, lon)
        
        await ProfileRepository.update_location(
            session, existing_profile, location, location_name
        )

        return existing_profile

    @staticmethod
    async def _get_excluded_user_ids(session: AsyncSession, user_id: str) -> list[str]:
        """
        Возвращает список user_id для исключения из поиска.
        Включает: уже свайпнутых + текущие матчи.
        """
        swiped = await RedisService.get_swiped_user_ids(user_id)
        matched = await MatchRepository.get_matched_user_ids(session, user_id)
        return list(set(swiped + matched))

    @staticmethod
    async def get_similar_profiles(
        session: AsyncSession,
        user_id: str,
        filters: ProfileFilterInput,
        limit: int = 20,
        offset: int = 0
    ) -> Sequence[ProfileWithDistanceDTO]:
        # 1. Get current user profile (for my interests and location)
        me = await ProfileRepository.get_by_user_id(session, user_id)
        if not me:
            raise NotOnboardedError()

        # 2. Extract my interests
        my_goal_ids = [g.id for g in me.goals] if me.goals else []
        my_sport_ids = [s.id for s in me.sports] if me.sports else []

        my_languages = [l for l in me.languages] if me.languages else []

        # 3. Get excluded users (swiped + matched)
        excluded_user_ids = await ProfileService._get_excluded_user_ids(session, user_id)

        # 4. Call repo
        return await ProfileRepository.get_similar_profiles(
            session=session,
            user_id=user_id,
            gender=filters.gender,
            age_min=filters.age_min,
            age_max=filters.age_max,
            height_min=filters.height_min,
            height_max=filters.height_max,
            weight_min=filters.weight_min,
            weight_max=filters.weight_max,
            goal_ids=filters.goal_ids,
            sport_ids=filters.sport_ids,
            distance_km=filters.distance_km,
            user_location=me.location,
            my_goal_ids=my_goal_ids,
            my_sport_ids=my_sport_ids,
            excluded_user_ids=excluded_user_ids or None,
            limit=limit,
            offset=offset,
            my_languages=my_languages,
            chronotype=filters.chronotype,
        )

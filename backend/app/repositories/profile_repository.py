from typing import Any, Optional, Sequence

from sqlalchemy import select, delete, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import column
from app.extensions.dtos.profile_dtos import ProfileWithDistanceDTO
from app.extensions.enums.profile_enums import Chronotype
from app.models.goal import Goal
from app.models.profile import Profile, profile_goals, profile_sports
from app.models.sport import Sport


class ProfileRepository:
    @staticmethod
    async def create(
            session: AsyncSession,
            profile: Profile,
    ) -> Profile:
        session.add(profile)
        await session.flush()
        # Refetch to load relationships and avoid MissingGreenlet
        result = await session.execute(
            select(Profile)
            .options(selectinload(Profile.goals), selectinload(Profile.sports))
            .where(Profile.user_id == profile.user_id)
        )
        return result.scalar_one()

    @staticmethod
    async def get_by_user_id(session: AsyncSession, user_id: str) -> Optional[Profile]:
        result = await session.execute(
            select(Profile)
            .options(selectinload(Profile.goals), selectinload(Profile.sports))
            .where(Profile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_user_ids(
            session: AsyncSession, user_ids: Sequence[str]
    ) -> dict[str, Profile]:
        """Batch-загрузка профилей по списку user_id."""
        if not user_ids:
            return {}
        result = await session.execute(
            select(Profile)
            .options(selectinload(Profile.goals), selectinload(Profile.sports))
            .where(Profile.user_id.in_(user_ids))
        )
        return {p.user_id: p for p in result.scalars().all()}

    @staticmethod
    async def update(
            session: AsyncSession,
            new_profile_data: dict,
            profile: Profile
    ) -> Profile:

        for key, value in new_profile_data.items():
            setattr(profile, key, value)

        await session.flush()
        await session.refresh(profile)
        return profile

    @staticmethod
    async def update_location(
            session: AsyncSession,
            profile: Profile,
            location: Any,
            location_name: Optional[str]
    ) -> Profile:
        profile.location = location
        profile.location_name = location_name
        await session.flush()
        await session.refresh(profile)
        return profile

    @staticmethod
    async def delete(session: AsyncSession, user_id: str) -> bool:
        result = await session.execute(
            delete(Profile).where(Profile.user_id == user_id)
        )
        return result.rowcount > 0

    @staticmethod
    async def get_similar_profiles(
            session: AsyncSession,
            user_id: str,
            gender: Optional[str] = None,
            age_min: Optional[int] = None,
            age_max: Optional[int] = None,
            height_min: Optional[float] = None,
            height_max: Optional[float] = None,
            weight_min: Optional[float] = None,
            weight_max: Optional[float] = None,
            goal_ids: Optional[list[int]] = None,
            sport_ids: Optional[list[int]] = None,
            distance_km: Optional[int] = None,
            user_location: Optional[Any] = None,
            my_goal_ids: Optional[list[int]] = None,
            my_sport_ids: Optional[list[int]] = None,
            excluded_user_ids: Optional[list[str]] = None,
            my_languages: Optional[list[str]] = None,
            chronotype: Optional[list[Chronotype]] = None,
            limit: int = 20,
            offset: int = 0
    ) -> Sequence[ProfileWithDistanceDTO]:
        # Prepare columns to select: Profile + Distance (if user_location provided)
        columns = [Profile]
        if user_location is not None:
            # Distance in km, rounded
            dist_expr = func.round(
                func.ST_Distance(
                    Profile.location,
                    user_location
                ) / 1000
            ).label("dist_km")
            columns.append(dist_expr)

        query = select(*columns).options(
            selectinload(Profile.goals),
            selectinload(Profile.sports)
        ).where(Profile.user_id != user_id)

        # Exclude already swiped users and current matches
        if excluded_user_ids:
            query = query.where(Profile.user_id.notin_(excluded_user_ids))

        # 1. Filters

        # Gender
        if gender:
            query = query.where(Profile.gender == gender)

        # Age (Birthdate)
        if age_min is not None or age_max is not None:
            today = func.current_date()
            # Age = year(today) - year(birthdate) - (1 if (month,day) < (month,day) else 0)
            # Simplified for SQL: extract year difference
            age_expr = func.extract('year', func.age(Profile.birthdate))
            if age_min is not None:
                query = query.where(age_expr >= age_min)
            if age_max is not None:
                query = query.where(age_expr <= age_max)

        # Height
        if height_min is not None:
            query = query.where(Profile.height >= height_min)
        if height_max is not None:
            query = query.where(Profile.height <= height_max)

        # Weight
        if weight_min is not None:
            query = query.where(Profile.weight >= weight_min)
        if weight_max is not None:
            query = query.where(Profile.weight <= weight_max)

        # Distance Filter
        if distance_km is not None and user_location is not None:
            # ST_DWithin(geog, geog, meters)
            query = query.where(
                func.ST_DWithin(
                    Profile.location,
                    user_location,
                    distance_km * 1000
                )
            )

        # Filter by Goals (must have at least one of selected)
        if goal_ids:
            query = query.where(
                Profile.goals.any(Goal.id.in_(goal_ids))
            )

        # Filter by Sports (must have at least one of selected)
        if sport_ids:
            query = query.where(
                Profile.sports.any(Sport.id.in_(sport_ids))
            )

        # Filter by Languages (хотя бы один общий язык)
        if my_languages:
            query = query.where(Profile.languages.op("&&")(my_languages))

        if chronotype:
            query = query.where(Profile.chronotype.op("&&")(chronotype))

        # 2. Sorting by Relevance
        # Score = matches in goals + matches in sports (with CURRENT USER's interests)

        score_expr = 0

        # Goals match score
        if my_goal_ids:
            goals_match = select(func.count()).select_from(profile_goals).where(
                and_(
                    profile_goals.c.profile_id == Profile.user_id,
                    profile_goals.c.goal_id.in_(my_goal_ids)
                )
            ).scalar_subquery()
            score_expr += goals_match

        # Sports match score
        if my_sport_ids:
            sports_match = select(func.count()).select_from(profile_sports).where(
                and_(
                    profile_sports.c.profile_id == Profile.user_id,
                    profile_sports.c.sport_id.in_(my_sport_ids)
                )
            ).scalar_subquery()
            score_expr += sports_match

        if my_languages:
            lang_match = select(func.count(column("l"))).select_from(
                func.unnest(Profile.languages).alias("l")
            ).where(column("l").in_(my_languages)).scalar_subquery()
            score_expr += lang_match

        if chronotype:
            chrono_match = select(func.count(column("c"))).select_from(
                func.unnest(Profile.chronotype).alias("c")
            ).where(column("c").in_(chronotype)).scalar_subquery()

            score_expr += func.coalesce(chrono_match, 0)

        # Add score to query for ordering
        # Note: if no my_interests provided, score is 0, order is undefined (or by ID)
        if my_goal_ids or my_sport_ids or my_languages or chronotype:
            query = query.order_by(desc(score_expr))

        query = query.limit(limit).offset(offset)

        result = await session.execute(query)

        # Build DTOs from results
        dtos: list[ProfileWithDistanceDTO] = []
        if user_location is not None:
            for row in result.all():
                profile = row[0]
                dist = row[1]
                dtos.append(ProfileWithDistanceDTO(
                    profile=profile,
                    distance_km=int(dist) if dist is not None else None
                ))
        else:
            for profile in result.scalars().all():
                dtos.append(ProfileWithDistanceDTO(profile=profile))

        return dtos

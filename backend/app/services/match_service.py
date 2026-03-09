from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.enums.notification_enums import NotificationType
from app.extensions.errors.profile import ProfileNotFoundError
from app.graphql.types.match import UnstartedMatchType
from app.graphql.types.profile import ProfileType
from app.models.match import Match
from app.repositories.match_repository import MatchRepository
from app.repositories.profile_repository import ProfileRepository
from app.services import RedisService
from app.services.chat_service import ChatService
from app.services.notification_service import NotificationService


class MatchService:
    @staticmethod
    async def swipe(
            session: AsyncSession,
            user_id: str,
            target_id: str,
            is_liked: bool,
    ) -> None:
        # Validate target user exists
        target_profile = await ProfileRepository.get_by_user_id(session, target_id)
        if not target_profile:
            raise ProfileNotFoundError()

        await RedisService.mark_user_as_swiped(user_id, target_id)

        if not is_liked:
            return None

        # Check if I already swiped this user
        already_swiped = await MatchRepository.get_existing_swipe(
            session=session,
            user_id=user_id,
            target_id=target_id
        )
        if already_swiped:
            return None

        existing_match = await MatchRepository.get_existing_swipe(
            session=session, 
            user_id=target_id,  # The other user who might have swiped me
            target_id=user_id   # Me
        )

        if existing_match:
            await MatchRepository.mark_as_matched(session, existing_match)
            chat = await ChatService.create_direct_chat(
                session=session,
                user1_id=user_id,
                user2_id=target_id,
            )
            existing_match.chat_id = chat.id

            profiles = await ProfileRepository.get_by_user_ids(session=session,
                                                               user_ids=[user_id, target_id])

            #send to target and user
            await NotificationService.create_notification(session=session,
                                                          user_id=user_id,
                                                          notification_type=NotificationType.NEW_MATCH,
                                                          payload={"name": profiles[target_id].name})

            await NotificationService.create_notification(session=session,
                                                          user_id=target_id,
                                                          notification_type=NotificationType.NEW_MATCH,
                                                          payload={"name": profiles[user_id].name})
        else:
            match = Match(
                user_id=user_id,
                target_id=target_id,
                is_match=False,
            )
            await MatchRepository.create(session, match)

    @staticmethod
    async def get_user_unstarted_matches(
            session: AsyncSession,
            user_id: str
    ) -> List[UnstartedMatchType]:
        matches = await MatchRepository.get_user_unstarted_matches(
            session=session,
            user_id=user_id
        )

        if not matches:
            return []
        result = []
        for match in matches:
            # Определяем ID "другого" пользователя
            other_user_id = match.target_id if match.user_id == user_id else match.user_id
            profile = await ProfileRepository.get_by_user_id(session, other_user_id)
            if profile:
                result.append(UnstartedMatchType(
                    matcher_profile=ProfileType.from_model(profile),
                    chat_id=match.chat_id,
                ))

        return result

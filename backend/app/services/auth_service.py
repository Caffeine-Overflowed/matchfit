from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.extensions.errors.auth import (
    InvalidCredentialsError,
    EmailAlreadyExistsError,
    InvalidRefreshTokenError,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.redis_service import RedisService
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.utils.observability import get_logger
from app.utils.validators import validate_email, validate_password

log = get_logger()


class AuthService:

    @classmethod
    async def register(
        cls, session: AsyncSession, email: str, password: str
    ) -> tuple[User, str, str, int, int]:
        """
        Регистрация нового пользователя.

        Returns:
            tuple: (user, access_token, refresh_token)
        """
        email = validate_email(email)
        validate_password(password)

        if await UserRepository.exists_by_email(session, email):
            raise EmailAlreadyExistsError()

        password_hash = hash_password(password)
        user = await UserRepository.create(session, email, password_hash)

        session_id = str(uuid4())
        access_token, access_expire = create_access_token(user.id, session_id)
        refresh_token, refresh_expire  = create_refresh_token()

        await RedisService.store_refresh_token(refresh_token, user.id, session_id)

        log.info("user.registered", user_id=user.id)
        return user, access_token, refresh_token, access_expire, refresh_expire

    @classmethod
    async def login(
        cls, session: AsyncSession, email: str, password: str
    ) -> tuple[User, str, str, int, int]:
        """
        Аутентификация пользователя.

        Returns:
            tuple: (user, access_token, refresh_token)
        """
        email = validate_email(email)

        user = await UserRepository.get_by_email(session, email)
        if not user:
            raise InvalidCredentialsError()

        if not user.password_hash or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()

        session_id = str(uuid4())
        access_token, access_expire = create_access_token(user.id, session_id)
        refresh_token, refresh_expire = create_refresh_token()

        await RedisService.store_refresh_token(refresh_token, user.id, session_id)

        log.info("user.logged_in", user_id=user.id)
        return user, access_token, refresh_token, access_expire, refresh_expire

    @classmethod
    async def refresh_tokens(cls, refresh_token: str) -> tuple[str, str, int, int]:
        """
        Обновление токенов по refresh token.

        Returns:
            tuple: (new_access_token, new_refresh_token)
        """
        token_data = await RedisService.get_refresh_token(refresh_token)
        if not token_data:
            raise InvalidRefreshTokenError()

        user_id = token_data.user_id

        # Создаём новую сессию
        session_id = str(uuid4())
        new_access_token, access_expire = create_access_token(user_id, session_id)
        new_refresh_token, refresh_expire = create_refresh_token()

        # Сначала сохраняем новый, потом удаляем старый (атомарность)
        await RedisService.store_refresh_token(new_refresh_token, user_id, session_id)
        await RedisService.delete_refresh_token(refresh_token)

        log.debug("tokens.refreshed", user_id=user_id)
        return new_access_token, new_refresh_token, access_expire, refresh_expire

    @classmethod
    async def get_current_user(cls, session: AsyncSession, user_id: str) -> User:
        """Получение текущего пользователя по ID."""
        user = await UserRepository.get_by_id(session, user_id)
        if not user:
            raise InvalidCredentialsError()
        return user

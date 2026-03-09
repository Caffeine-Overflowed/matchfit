import secrets
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Config
from app.extensions.errors.auth import GoogleAuthError, InvalidOAuthStateError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.redis_service import RedisService
from app.utils.auth import create_access_token, create_refresh_token, hash_password
from app.utils.observability import get_logger

log = get_logger()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


class GoogleAuthService:

    @classmethod
    async def get_auth_url(cls) -> tuple[str, str]:
        """
        Генерирует URL для авторизации через Google.

        Returns:
            tuple: (url, state)
        """
        state = secrets.token_urlsafe(32)
        await RedisService.store_oauth_state(state)

        params = {
            "client_id": Config.google.client_id,
            "redirect_uri": Config.google.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }

        url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
        return url, state

    @classmethod
    async def authenticate(
        cls, session: AsyncSession, code: str, state: str
    ) -> tuple[User, str, str, int, int]:
        """
        Обменивает authorization code на токены и создаёт/логинит пользователя.

        Returns:
            tuple: (user, access_token, refresh_token)
        """
        if not await RedisService.verify_oauth_state(state):
            log.warning("google.invalid_state", state=state[:8] + "...")
            raise InvalidOAuthStateError()

        google_tokens = await cls._exchange_code(code)
        user_info = await cls._get_user_info(google_tokens["access_token"])

        google_id = user_info["id"]
        email = user_info["email"]

        user = await UserRepository.get_by_google_id(session, google_id)

        if not user:
            user = await UserRepository.get_by_email(session, email)
            if user:
                user = await UserRepository.link_google_id(session, user, google_id)
                log.info("google.linked", user_id=user.id, google_id=google_id)
            else:
                # Generate random password for Google users (they use OAuth to login)
                random_password = secrets.token_urlsafe(32)
                user = await UserRepository.create(
                    session, email=email, google_id=google_id,
                    password_hash=hash_password(random_password)
                )
                log.info("google.registered", user_id=user.id, google_id=google_id)
        else:
            log.info("google.logged_in", user_id=user.id)

        session_id = str(uuid4())
        access_token, access_token_expire = create_access_token(user.id, session_id)
        refresh_token, refresh_token_expire = create_refresh_token()

        await RedisService.store_refresh_token(refresh_token, user.id, session_id)

        return user, access_token, refresh_token, access_token_expire, refresh_token_expire

    @classmethod
    async def _exchange_code(cls, code: str) -> dict:
        """Обменивает authorization code на токены Google."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": Config.google.client_id,
                    "client_secret": Config.google.client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": Config.google.redirect_uri,
                },
            )

        if response.status_code != 200:
            log.error("google.token_exchange_failed", status=response.status_code, response=response.text)
            raise GoogleAuthError()

        return response.json()

    @classmethod
    async def _get_user_info(cls, access_token: str) -> dict:
        """Получает информацию о пользователе из Google."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

        if response.status_code != 200:
            log.error("google.userinfo_failed", status=response.status_code)
            raise GoogleAuthError()

        data = response.json()
        if "id" not in data or "email" not in data:
            log.error("google.userinfo_incomplete", data=data)
            raise GoogleAuthError()

        return data

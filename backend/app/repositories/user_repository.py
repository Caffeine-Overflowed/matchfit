from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    @staticmethod
    async def create(
        session: AsyncSession,
        email: str,
        password_hash: Optional[str] = None,
        google_id: Optional[str] = None,
    ) -> User:
        user = User(email=email, password_hash=password_hash, google_id=google_id)
        session.add(user)
        await session.flush()
        return user

    @staticmethod
    async def get_by_google_id(session: AsyncSession, google_id: str) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.google_id == google_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def link_google_id(
        session: AsyncSession, user: User, google_id: str
    ) -> User:
        user.google_id = google_id
        await session.flush()
        return user

    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: str) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def exists_by_email(session: AsyncSession, email: str) -> bool:
        result = await session.execute(
            select(User.id).where(User.email == email).limit(1)
        )
        return result.scalar_one_or_none() is not None

import asyncio
import json
import os
from uuid import uuid4
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app import app
from app.config import Config
from app.models.user import User
from app.utils.auth import create_access_token, hash_password
from app.utils.lifespan import lifespan as app_lifespan


class TestLocations:
    """Координаты для тестов с допуском в mock."""
    BERLIN = {"lat": 52.5200, "lon": 13.4050, "name": "Berlin, Germany"}
    NEW_YORK = {"lat": 40.7128, "lon": -74.0060, "name": "New York, United States"}
    PARIS = {"lat": 48.8566, "lon": 2.3522, "name": "Paris, France"}
    MOSCOW = {"lat": 55.7558, "lon": 37.6173, "name": "Moscow, Russia"}
    # Nearby Berlin for distance tests
    BERLIN_NEARBY = {"lat": 52.5100, "lon": 13.4000, "name": "Berlin, Germany"}

# Force test env if needed, but usually .env is loaded.
# Config should be loaded already.

@pytest.fixture(scope="session", autouse=True)
async def lifespan_manager():
    """Manually run lifespan events (Database.init, etc)."""
    async with app_lifespan(app):
        yield

@pytest.fixture(scope="session")
async def db_session():
    """Session for checking DB state and seeding data."""
    engine = create_async_engine(Config.db.async_dsn)
    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session
    await engine.dispose()

@pytest.fixture(scope="session")
async def client():
    """Async HTTP client for making requests to the app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

@pytest.fixture
async def user_factory(db_session: AsyncSession):
    """Factory to create temporary users."""
    from sqlalchemy import text

    created_users = []

    async def _create():
        email = f"test_{uuid4()}@example.com"
        user_obj = User(email=email, password_hash=hash_password("password"))
        db_session.add(user_obj)
        await db_session.commit()
        await db_session.refresh(user_obj)
        created_users.append(user_obj)
        return user_obj

    yield _create

    # Cleanup in correct order (respect FK constraints)
    for u in created_users:
        try:
            # Delete related records first
            await db_session.execute(text("DELETE FROM notifications WHERE user_id = :id"), {"id": u.id})
            await db_session.execute(text("DELETE FROM messages WHERE sender_id = :id"), {"id": u.id})
            await db_session.execute(text("DELETE FROM chat_participants WHERE user_id = :id"), {"id": u.id})
            await db_session.execute(text("DELETE FROM event_participants WHERE user_id = :id"), {"id": u.id})
            await db_session.execute(text("DELETE FROM matches WHERE user_id = :id OR target_id = :id"), {"id": u.id})
            await db_session.execute(text("DELETE FROM profiles WHERE user_id = :id"), {"id": u.id})
            await db_session.execute(text("DELETE FROM users WHERE id = :id"), {"id": u.id})
        except Exception:
            await db_session.rollback()  # Reset session state on error
    try:
        await db_session.commit()
    except Exception:
        await db_session.rollback()

@pytest.fixture
async def user(user_factory):
    """Default single user."""
    return await user_factory()

@pytest.fixture
def get_auth_headers():
    """Helper to generate headers for any user."""
    def _headers(user):
        token, _ = create_access_token(user.id, str(uuid4()))
        return {"Authorization": f"Bearer {token}"}
    return _headers

@pytest.fixture
def auth_headers(user, get_auth_headers):
    """Headers for the default user."""
    return get_auth_headers(user)

@pytest.fixture(autouse=True)
def mock_external_services(monkeypatch):
    """Mocks external services (Minio, GeoService) to avoid network calls."""
    
    # Mock Minio
    async def mock_upload(*args, **kwargs):
        return "mocked_etag"
    
    from app.utils.minio import MinioService
    monkeypatch.setattr(MinioService, "upload_object", mock_upload)

    # Mock GeoService with tolerance for coordinate variations
    async def mock_geo(lat, lon):
        """Mock с толерантностью к небольшим отклонениям координат."""
        if 52.50 <= lat <= 52.55 and 13.35 <= lon <= 13.45:
            return "Berlin, Germany"
        if 40.70 <= lat <= 40.75 and -74.02 <= lon <= -73.98:
            return "New York, United States"
        if 48.80 <= lat <= 48.90 and 2.30 <= lon <= 2.40:
            return "Paris, France"
        if 55.70 <= lat <= 55.80 and 37.55 <= lon <= 37.70:
            return "Moscow, Russia"
        return "Mock City, Mock Country"

    from app.services.geo_service import GeoService
    monkeypatch.setattr(GeoService, "get_location_name", mock_geo)


@pytest.fixture
def create_profile_helper(client):
    """Переиспользуемый helper для создания профиля."""
    create_profile_mut = """
    mutation CreateProfile($data: ProfileInput!) {
        createProfile(data: $data) { name }
    }
    """

    async def _create(
        headers,
        name: str,
        lat: float = TestLocations.BERLIN["lat"],
        lon: float = TestLocations.BERLIN["lon"],
        gender: str = "male",
        birth_year: int = 1990,
        languages: list = None,
        chronotype: str = "EARLY_BIRD"
    ):
        variables = {
            "data": {
                "name": name,
                "birthYear": birth_year,
                "birthMonth": 1,
                "gender": gender,
                "avatar": None,
                "languages": languages or ["en"],
                "sportIds": [],
                "goalIds": [],
                "lat": lat,
                "lon": lon,
                "chronotype": chronotype
            }
        }
        files = {"0": ("avatar.jpg", b"fake", "image/jpeg")}
        ops = {"query": create_profile_mut, "variables": variables}
        map_d = {"0": ["variables.data.avatar"]}
        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers
        )
        return resp

    return _create


@pytest.fixture
def create_chat_helpers(db_session):
    """Helper fixtures for creating chats directly via service (since GraphQL mutations were removed)."""
    from app.services.chat_service import ChatService
    from app.utils.database import Database

    async def create_direct_chat(user1_id: str, user2_id: str):
        """Create a direct chat between two users."""
        async with Database.get_session() as session:
            chat = await ChatService.create_direct_chat(session, user1_id, user2_id)
            return chat

    async def create_group(host_id: str, title: str, participant_ids: list[str]):
        """Create a group chat."""
        async with Database.get_session() as session:
            chat = await ChatService.create_group(session, host_id, title, participant_ids)
            return chat

    async def create_channel(host_id: str, title: str, participant_ids: list[str]):
        """Create a channel."""
        async with Database.get_session() as session:
            chat = await ChatService.create_channel(session, host_id, title, participant_ids)
            return chat

    return {
        "direct": create_direct_chat,
        "group": create_group,
        "channel": create_channel
    }


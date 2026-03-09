import pytest
from httpx import AsyncClient

from conftest import TestLocations


@pytest.mark.asyncio
async def test_me_query(client: AsyncClient, user, auth_headers):
    """Test getting current user info."""
    query = """
    query {
        me {
            id
            email
            createdAt
        }
    }
    """
    resp = await client.post("/graphql", json={"query": query}, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    me = data["data"]["me"]
    assert me["id"] == user.id
    assert me["email"] == user.email
    assert me["createdAt"] is not None


@pytest.mark.asyncio
async def test_my_profile_query(client: AsyncClient, user, auth_headers, create_profile_helper):
    """Test getting own profile."""
    # First create a profile
    resp = await create_profile_helper(
        auth_headers,
        "Test User",
        lat=TestLocations.MOSCOW["lat"],
        lon=TestLocations.MOSCOW["lon"],
        languages=["en", "ru"]
    )
    assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

    # Now query my profile
    query = """
    query {
        myProfile {
            name
            gender
            languages
            locationName
            avatarUrl
        }
    }
    """
    resp = await client.post("/graphql", json={"query": query}, headers=auth_headers)
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    profile = data["data"]["myProfile"]
    assert profile is not None
    assert profile["name"] == "Test User"
    assert profile["gender"] == "male"
    assert "en" in profile["languages"]
    assert "ru" in profile["languages"]


@pytest.mark.asyncio
async def test_profile_by_id_query(client: AsyncClient, user_factory, get_auth_headers, create_profile_helper):
    """Test getting another user's profile by ID."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    # Create profile for user2
    resp = await create_profile_helper(
        headers2,
        "Other User",
        lat=TestLocations.PARIS["lat"],
        lon=TestLocations.PARIS["lon"],
        gender="female",
        languages=["de"]
    )
    assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

    # User1 queries user2's profile
    query = """
    query GetProfile($userId: String!) {
        profile(userId: $userId) {
            name
            gender
        }
    }
    """
    resp = await client.post(
        "/graphql",
        json={"query": query, "variables": {"userId": user2.id}},
        headers=headers1
    )
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    profile = data["data"]["profile"]
    assert profile["name"] == "Other User"
    assert profile["gender"] == "female"


@pytest.mark.asyncio
async def test_similar_profiles_query(client: AsyncClient, user_factory, get_auth_headers, create_profile_helper):
    """Test finding similar profiles."""
    user1 = await user_factory()
    user2 = await user_factory()
    user3 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)
    headers3 = get_auth_headers(user3)

    # Create profiles - all in Berlin area
    await create_profile_helper(headers1, "User One")
    await create_profile_helper(headers2, "User Two", gender="female")
    await create_profile_helper(headers3, "User Three", gender="female")

    # User1 searches for similar profiles (females nearby)
    query = """
    query SimilarProfiles($filters: ProfileFilterInput!, $limit: Int) {
        similarProfiles(filters: $filters, limit: $limit) {
            name
            gender
            distance
        }
    }
    """
    resp = await client.post(
        "/graphql",
        json={
            "query": query,
            "variables": {
                "filters": {"gender": "female"},
                "limit": 10
            }
        },
        headers=headers1
    )
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    profiles = data["data"]["similarProfiles"]
    assert len(profiles) >= 2
    # All should be female
    for p in profiles:
        assert p["gender"] == "female"


@pytest.mark.asyncio
async def test_my_profile_returns_null_when_no_profile(client: AsyncClient, user, auth_headers):
    """Test that myProfile returns null for user without profile."""
    query = """
    query { myProfile { name } }
    """
    resp = await client.post("/graphql", json={"query": query}, headers=auth_headers)
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    assert data["data"]["myProfile"] is None

import json
import pytest
from httpx import AsyncClient
from sqlalchemy import text

from conftest import TestLocations


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """Test that protected queries require authentication."""
    query = """
    query { myProfile { name } }
    """
    resp = await client.post("/graphql", json={"query": query})
    data = resp.json()

    # Should have an error
    assert "errors" in data
    error = data["errors"][0]
    # Check error code in extensions if available, otherwise check message
    error_code = error.get("extensions", {}).get("code", "")
    error_message = error.get("message", "").lower()
    assert (
        error_code == "NOT_AUTHENTICATED" or
        "not_authenticated" in error_code.lower() or
        any(kw in error_message for kw in ["authenticated", "permission", "unauthorized", "auth"])
    ), f"Expected auth error, got: {error}"


@pytest.mark.asyncio
async def test_invalid_token(client: AsyncClient):
    """Test that invalid token is rejected."""
    query = """
    query { me { id } }
    """
    resp = await client.post(
        "/graphql",
        json={"query": query},
        headers={"Authorization": "Bearer invalid_token_here"}
    )
    data = resp.json()
    assert "errors" in data
    # Invalid token should result in auth error
    error = data["errors"][0]
    error_message = error.get("message", "").lower()
    assert any(kw in error_message for kw in ["token", "invalid", "auth", "expired"]), \
        f"Expected token-related error, got: {error}"


@pytest.mark.asyncio
async def test_duplicate_registration(client: AsyncClient, db_session):
    """Test that registering with same email fails."""
    register_mut = """
    mutation Register($data: RegisterInput!) {
        register(data: $data) {
            user { id email }
        }
    }
    """

    email = "duplicate_test@example.com"
    variables = {"data": {"email": email, "password": "Password123!"}}

    # First registration should succeed
    resp = await client.post("/graphql", json={"query": register_mut, "variables": variables})
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    user_id = data["data"]["register"]["user"]["id"]

    try:
        # Second registration with same email should fail
        resp = await client.post("/graphql", json={"query": register_mut, "variables": variables})
        data = resp.json()
        assert "errors" in data, "Expected error for duplicate registration"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "duplicate" in error_message or
            "exists" in error_message or
            "already" in error_message or
            "email_already_exists" in error_code.lower()
        ), f"Expected duplicate email error, got: {error}"
    finally:
        # Cleanup
        await db_session.execute(text("DELETE FROM users WHERE id = :id"), {"id": user_id})
        await db_session.commit()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db_session):
    """Test that wrong password fails login."""
    # First register
    register_mut = """
    mutation Register($data: RegisterInput!) {
        register(data: $data) {
            user { id }
        }
    }
    """
    email = "wrong_pass_test@example.com"
    resp = await client.post(
        "/graphql",
        json={
            "query": register_mut,
            "variables": {"data": {"email": email, "password": "CorrectPass123!"}}
        }
    )
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    user_id = data["data"]["register"]["user"]["id"]

    try:
        # Try login with wrong password
        login_mut = """
        mutation Login($data: LoginInput!) {
            login(data: $data) {
                user { id }
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={
                "query": login_mut,
                "variables": {"data": {"email": email, "password": "WrongPass123!"}}
            }
        )
        data = resp.json()
        assert "errors" in data, "Expected error for wrong password"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "password" in error_message or
            "invalid" in error_message or
            "credentials" in error_message or
            "invalid_credentials" in error_code.lower()
        ), f"Expected invalid credentials error, got: {error}"
    finally:
        # Cleanup
        await db_session.execute(text("DELETE FROM users WHERE id = :id"), {"id": user_id})
        await db_session.commit()


@pytest.mark.asyncio
async def test_profile_not_found(client: AsyncClient, auth_headers):
    """Test getting non-existent profile."""
    query = """
    query GetProfile($userId: String!) {
        profile(userId: $userId) { name }
    }
    """
    resp = await client.post(
        "/graphql",
        json={"query": query, "variables": {"userId": "non-existent-id"}},
        headers=auth_headers
    )
    data = resp.json()
    assert "errors" in data, "Expected error for non-existent profile"
    error = data["errors"][0]
    error_code = error.get("extensions", {}).get("code", "")
    error_message = error.get("message", "").lower()
    assert (
        "not found" in error_message or
        "not_found" in error_code.lower() or
        "profile_not_found" in error_code.lower() or
        "profile_not_found" in error_message
    ), f"Expected not found error, got: {error}"


@pytest.mark.asyncio
async def test_join_nonexistent_event(client: AsyncClient, auth_headers):
    """Test joining non-existent event."""
    mutation = """
    mutation JoinEvent($eventId: String!) {
        joinEvent(eventId: $eventId) { id }
    }
    """
    resp = await client.post(
        "/graphql",
        json={"query": mutation, "variables": {"eventId": "fake-event-id"}},
        headers=auth_headers
    )
    data = resp.json()
    assert "errors" in data, "Expected error for non-existent event"
    error = data["errors"][0]
    error_code = error.get("extensions", {}).get("code", "")
    error_message = error.get("message", "").lower()
    assert (
        "not found" in error_message or
        "not_found" in error_code.lower() or
        "event_not_found" in error_code.lower() or
        "event_not_found" in error_message
    ), f"Expected not found error, got: {error}"


@pytest.mark.asyncio
async def test_create_profile_twice(client: AsyncClient, auth_headers):
    """Test that creating profile twice fails."""
    create_profile_mut = """
    mutation CreateProfile($data: ProfileInput!) {
        createProfile(data: $data) { name }
    }
    """
    variables = {
        "data": {
            "name": "First Profile",
            "birthYear": 1990,
            "birthMonth": 1,
            "gender": "male",
            "avatar": None,
            "languages": ["en"],
            "sportIds": [],
            "goalIds": [],
            "lat": TestLocations.BERLIN["lat"],
            "lon": TestLocations.BERLIN["lon"],
            "chronotype": "EARLY_BIRD"
        }
    }
    files = {"0": ("avatar.jpg", b"fake", "image/jpeg")}
    ops = {"query": create_profile_mut, "variables": variables}
    map_d = {"0": ["variables.data.avatar"]}

    # First creation should succeed
    resp = await client.post(
        "/graphql",
        data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
        files=files,
        headers=auth_headers
    )
    assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

    # Second creation should fail
    variables["data"]["name"] = "Second Profile"
    ops = {"query": create_profile_mut, "variables": variables}

    resp = await client.post(
        "/graphql",
        data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
        files=files,
        headers=auth_headers
    )
    data = resp.json()
    assert "errors" in data, "Expected error for duplicate profile creation"
    error = data["errors"][0]
    error_code = error.get("extensions", {}).get("code", "")
    error_message = error.get("message", "").lower()
    # Should contain onboarding_already_completed or similar
    assert (
        "already" in error_message or
        "completed" in error_message or
        "exists" in error_message or
        "onboarding" in error_code.lower()
    ), f"Expected already completed error, got: {error}"

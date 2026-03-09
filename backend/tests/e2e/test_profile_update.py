import json
import pytest
from httpx import AsyncClient

from conftest import TestLocations


@pytest.mark.asyncio
async def test_update_profile_basic(client: AsyncClient, auth_headers, create_profile_helper):
    """Test basic profile update after creation."""
    # First create a profile
    resp = await create_profile_helper(
        auth_headers,
        "Original Name",
        lat=TestLocations.BERLIN["lat"],
        lon=TestLocations.BERLIN["lon"],
        languages=["en"]
    )
    assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

    # Now update the profile
    update_mutation = """
    mutation UpdateProfile($data: ProfileInput!) {
        updateProfile(data: $data) {
            name
            bio
            languages
            gender
            locationName
        }
    }
    """

    update_variables = {
        "data": {
            "name": "Updated Name",
            "birthYear": 1990,
            "birthMonth": 1,
            "gender": "male",
            "bio": "Updated bio text",
            "avatar": None,
            "languages": ["en", "de", "ru"],
            "sportIds": [],
            "goalIds": [],
            "lat": TestLocations.BERLIN["lat"],
            "lon": TestLocations.BERLIN["lon"],
            "chronotype": "EARLY_BIRD"
        }
    }

    # Multipart request for GraphQL Upload
    files = {"0": ("avatar.jpg", b"fake", "image/jpeg")}
    ops = {"query": update_mutation, "variables": update_variables}
    map_d = {"0": ["variables.data.avatar"]}

    resp = await client.post(
        "/graphql",
        data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
        files=files,
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    profile = data["data"]["updateProfile"]
    assert profile["name"] == "Updated Name"
    assert profile["bio"] == "Updated bio text"
    assert "en" in profile["languages"]
    assert "de" in profile["languages"]
    assert "ru" in profile["languages"]


@pytest.mark.asyncio
async def test_update_profile_change_location(client: AsyncClient, auth_headers, create_profile_helper):
    """Test updating profile with new location."""
    # First create a profile in Berlin
    resp = await create_profile_helper(
        auth_headers,
        "Location Test User",
        lat=TestLocations.BERLIN["lat"],
        lon=TestLocations.BERLIN["lon"]
    )
    assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

    # Update profile with Paris location
    update_mutation = """
    mutation UpdateProfile($data: ProfileInput!) {
        updateProfile(data: $data) {
            name
            locationName
        }
    }
    """

    update_variables = {
        "data": {
            "name": "Location Test User",
            "birthYear": 1990,
            "birthMonth": 1,
            "gender": "male",
            "avatar": None,
            "languages": ["en"],
            "sportIds": [],
            "goalIds": [],
            "lat": TestLocations.PARIS["lat"],
            "lon": TestLocations.PARIS["lon"],
            "chronotype": "EARLY_BIRD"
        }
    }

    files = {"0": ("avatar.jpg", b"fake", "image/jpeg")}
    ops = {"query": update_mutation, "variables": update_variables}
    map_d = {"0": ["variables.data.avatar"]}

    resp = await client.post(
        "/graphql",
        data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
        files=files,
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    profile = data["data"]["updateProfile"]
    # Location should now be Paris (from mock)
    assert "Paris" in str(profile["locationName"]) or "France" in str(profile["locationName"])


@pytest.mark.asyncio
async def test_update_profile_without_existing_profile(client: AsyncClient, user_factory, get_auth_headers):
    """Test that updating profile fails when no profile exists."""
    # Create a new user without profile
    new_user = await user_factory()
    headers = get_auth_headers(new_user)

    update_mutation = """
    mutation UpdateProfile($data: ProfileInput!) {
        updateProfile(data: $data) {
            name
        }
    }
    """

    update_variables = {
        "data": {
            "name": "No Profile User",
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
    ops = {"query": update_mutation, "variables": update_variables}
    map_d = {"0": ["variables.data.avatar"]}

    resp = await client.post(
        "/graphql",
        data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
        files=files,
        headers=headers
    )
    data = resp.json()
    # Should return an error - profile doesn't exist
    assert "errors" in data, "Expected error when updating non-existent profile"
    error = data["errors"][0]
    error_code = error.get("extensions", {}).get("code", "")
    error_message = error.get("message", "").lower()
    assert (
        "not found" in error_message or
        "not_found" in error_code.lower() or
        "profile" in error_message or
        "doesn't exist" in error_message or
        "does not exist" in error_message
    ), f"Expected profile not found error, got: {error}"

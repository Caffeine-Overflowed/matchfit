import json
import pytest
from httpx import AsyncClient

from conftest import TestLocations


@pytest.mark.asyncio
async def test_create_update_profile_flow(client: AsyncClient, auth_headers):
    """Test creating profile and updating location."""
    # 1. Create Profile
    mutation = """
    mutation CreateProfile($data: ProfileInput!) {
        createProfile(data: $data) {
            name
            bio
            locationName
            languages
            gender
        }
    }
    """

    variables = {
        "data": {
            "name": "E2E Test User",
            "birthYear": 1995,
            "birthMonth": 5,
            "gender": "male",
            "bio": "Just an automated test user",
            "languages": ["en", "fr"],
            "lat": TestLocations.BERLIN["lat"],
            "lon": TestLocations.BERLIN["lon"],
            "sportIds": [],
            "goalIds": [],
            "weight": 70.0,
            "height": 175.0,
            "avatar": None,
            "chronotype": "EARLY_BIRD"
        }
    }

    # Multipart request for GraphQL Upload
    operations = {
        "query": mutation,
        "variables": variables
    }

    map_data = {
        "0": ["variables.data.avatar"]
    }

    # Fake image content
    files = {
        "0": ("avatar.jpg", b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00", "image/jpeg")
    }

    response = await client.post(
        "/graphql",
        data={
            "operations": json.dumps(operations),
            "map": json.dumps(map_data)
        },
        files=files,
        headers=auth_headers
    )

    assert response.status_code == 200, f"Response: {response.text}"
    resp_data = response.json()
    assert "errors" not in resp_data, f"Unexpected error: {resp_data.get('errors')}"

    profile = resp_data["data"]["createProfile"]
    assert profile["name"] == "E2E Test User"
    assert profile["gender"] == "male"
    assert profile["bio"] == "Just an automated test user"
    # Location name should contain Berlin (from mock)
    assert "Berlin" in str(profile["locationName"])
    assert "fr" in profile["languages"]
    assert "en" in profile["languages"]

    # 2. Update Location (New Mutation)
    mutation_loc = """
    mutation UpdateLocation($data: UpdateLocationInput!) {
        updateLocation(data: $data) {
            locationName
        }
    }
    """

    vars_loc = {
        "data": {
            "lat": TestLocations.NEW_YORK["lat"],
            "lon": TestLocations.NEW_YORK["lon"]
        }
    }

    response = await client.post(
        "/graphql",
        json={"query": mutation_loc, "variables": vars_loc},
        headers=auth_headers
    )

    assert response.status_code == 200
    resp_data = response.json()
    assert "errors" not in resp_data, f"Unexpected error: {resp_data.get('errors')}"
    loc_name = resp_data["data"]["updateLocation"]["locationName"]
    # Should contain New York (from mock)
    assert "New York" in str(loc_name) or "United States" in str(loc_name)

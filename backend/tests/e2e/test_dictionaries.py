import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sports_query(client: AsyncClient):
    """Test getting all sports."""
    query = """
    query {
        sports {
            id
            name
            iconUrl
        }
    }
    """
    resp = await client.post("/graphql", json={"query": query})
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, data["errors"]

    sports = data["data"]["sports"]
    assert isinstance(sports, list)
    assert len(sports) > 0, "Should have seeded sports"

    # Check structure
    sport = sports[0]
    assert "id" in sport
    assert "name" in sport
    assert "iconUrl" in sport


@pytest.mark.asyncio
async def test_goals_query(client: AsyncClient):
    """Test getting all goals."""
    query = """
    query {
        goals {
            id
            name
            iconUrl
            description
        }
    }
    """
    resp = await client.post("/graphql", json={"query": query})
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, data["errors"]

    goals = data["data"]["goals"]
    assert isinstance(goals, list)
    assert len(goals) > 0, "Should have seeded goals"

    # Check structure
    goal = goals[0]
    assert "id" in goal
    assert "name" in goal
    assert "iconUrl" in goal
    assert "description" in goal

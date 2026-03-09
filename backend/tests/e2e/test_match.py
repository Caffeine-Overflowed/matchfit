import pytest
from httpx import AsyncClient
from sqlalchemy import text


@pytest.mark.asyncio
async def test_swipe_and_match_flow(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test the full swipe → mutual like → match creation flow."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    # Create profiles for both users
    resp1 = await create_profile_helper(headers1, "User One")
    assert resp1.status_code == 200
    assert "errors" not in resp1.json(), f"Unexpected error: {resp1.json().get('errors')}"

    resp2 = await create_profile_helper(headers2, "User Two")
    assert resp2.status_code == 200
    assert "errors" not in resp2.json(), f"Unexpected error: {resp2.json().get('errors')}"

    # Swipe mutation
    swipe_mut = """
    mutation Swipe($targetId: String!, $isLiked: Boolean!) {
        swipe(targetId: $targetId, isLiked: $isLiked)
    }
    """

    # User1 swipes RIGHT on User2 (like)
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user2.id, "isLiked": True}
        },
        headers=headers1
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    assert data["data"]["swipe"] is True

    # User2 swipes LEFT on User1 (dislike) - no match yet
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user1.id, "isLiked": False}
        },
        headers=headers2
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    # Check no match was created (User2 disliked)
    matches_query = """
    query { myRecentMatches { chatId matcherProfile { name } } }
    """
    resp = await client.post("/graphql", json={"query": matches_query}, headers=headers1)
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    # Should be empty or not contain User2
    matches = data["data"]["myRecentMatches"]
    assert all(m["matcherProfile"]["name"] != "User Two" for m in matches)

    # Now create User3 for mutual match test
    user3 = await user_factory()
    headers3 = get_auth_headers(user3)
    resp3 = await create_profile_helper(headers3, "User Three")
    assert "errors" not in resp3.json(), f"Unexpected error: {resp3.json().get('errors')}"

    # User1 likes User3
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user3.id, "isLiked": True}
        },
        headers=headers1
    )
    assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

    # User3 likes User1 back → should create match
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user1.id, "isLiked": True}
        },
        headers=headers3
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

    # Check match was created for User1
    resp = await client.post("/graphql", json={"query": matches_query}, headers=headers1)
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    matches = data["data"]["myRecentMatches"]
    # Should find User Three in matches
    user3_match = next((m for m in matches if m["matcherProfile"]["name"] == "User Three"), None)
    assert user3_match is not None, f"Expected User Three in matches, got: {matches}"
    assert user3_match["chatId"] is not None

    # Cleanup
    try:
        await db_session.execute(text("DELETE FROM matches WHERE user_id = :id OR target_id = :id"), {"id": user1.id})
        await db_session.execute(text("DELETE FROM matches WHERE user_id = :id OR target_id = :id"), {"id": user2.id})
        await db_session.execute(text("DELETE FROM matches WHERE user_id = :id OR target_id = :id"), {"id": user3.id})
        await db_session.commit()
    except Exception:
        pass


@pytest.mark.asyncio
async def test_swipe_dislike(client: AsyncClient, user_factory, get_auth_headers, db_session, create_profile_helper):
    """Test that dislike swipe doesn't create a match record."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    # Create profiles for both users
    await create_profile_helper(headers1, "User One")
    await create_profile_helper(headers2, "User Two")

    swipe_mut = """
    mutation Swipe($targetId: String!, $isLiked: Boolean!) {
        swipe(targetId: $targetId, isLiked: $isLiked)
    }
    """

    # User1 dislikes User2
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user2.id, "isLiked": False}
        },
        headers=headers1
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
    assert data["data"]["swipe"] is True

    # Verify no match record was created in DB
    result = await db_session.execute(
        text("SELECT COUNT(*) FROM matches WHERE user_id = :uid AND target_id = :tid"),
        {"uid": user1.id, "tid": user2.id}
    )
    count = result.scalar()
    assert count == 0, "Dislike should not create a match record"


@pytest.mark.asyncio
async def test_swipe_on_self(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    create_profile_helper
):
    """Test that swiping on yourself is not allowed or handled properly."""
    user1 = await user_factory()
    headers1 = get_auth_headers(user1)

    # Create profile for user
    await create_profile_helper(headers1, "User One")

    swipe_mut = """
    mutation Swipe($targetId: String!, $isLiked: Boolean!) {
        swipe(targetId: $targetId, isLiked: $isLiked)
    }
    """

    # User1 tries to swipe on themselves
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user1.id, "isLiked": True}
        },
        headers=headers1
    )
    data = resp.json()
    # Should either return an error or be a no-op
    # The expected behavior depends on implementation
    if "errors" in data:
        error = data["errors"][0]
        error_message = error.get("message", "").lower()
        # Should indicate self-swipe is not allowed
        assert any(kw in error_message for kw in ["self", "yourself", "same", "invalid"]), \
            f"Expected self-swipe error, got: {error}"


@pytest.mark.asyncio
async def test_swipe_on_nonexistent_user(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    create_profile_helper
):
    """Test that swiping on a non-existent user returns an error."""
    user1 = await user_factory()
    headers1 = get_auth_headers(user1)

    # Create profile for user
    await create_profile_helper(headers1, "User One")

    swipe_mut = """
    mutation Swipe($targetId: String!, $isLiked: Boolean!) {
        swipe(targetId: $targetId, isLiked: $isLiked)
    }
    """

    # User1 tries to swipe on non-existent user
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": "non-existent-user-id", "isLiked": True}
        },
        headers=headers1
    )
    data = resp.json()
    # Should return an error
    assert "errors" in data, "Expected error for swiping on non-existent user"
    error = data["errors"][0]
    error_code = error.get("extensions", {}).get("code", "")
    error_message = error.get("message", "").lower()
    assert (
        "not found" in error_message or
        "not_found" in error_code.lower() or
        "profile_not_found" in error_code.lower() or
        "profile_not_found" in error_message or
        "profile" in error_message or
        "user" in error_message
    ), f"Expected not found error, got: {error}"


@pytest.mark.asyncio
async def test_double_swipe_same_user(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test that swiping twice on the same user is idempotent or handled properly."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)

    # Create profiles
    await create_profile_helper(headers1, "User One")
    await create_profile_helper(get_auth_headers(user2), "User Two")

    swipe_mut = """
    mutation Swipe($targetId: String!, $isLiked: Boolean!) {
        swipe(targetId: $targetId, isLiked: $isLiked)
    }
    """

    # First swipe - like
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user2.id, "isLiked": True}
        },
        headers=headers1
    )
    data = resp.json()
    assert "errors" not in data, f"Unexpected error on first swipe: {data.get('errors')}"

    # Second swipe - same direction (like again)
    resp = await client.post(
        "/graphql",
        json={
            "query": swipe_mut,
            "variables": {"targetId": user2.id, "isLiked": True}
        },
        headers=headers1
    )
    data = resp.json()
    # Should either succeed (idempotent) or return an error (already swiped)
    # Either is acceptable depending on implementation
    if "errors" in data:
        error = data["errors"][0]
        error_message = error.get("message", "").lower()
        assert any(kw in error_message for kw in ["already", "duplicate", "swiped"]), \
            f"Expected already swiped error, got: {error}"

    # Cleanup
    try:
        await db_session.execute(
            text("DELETE FROM matches WHERE user_id = :id OR target_id = :id"),
            {"id": user1.id}
        )
        await db_session.commit()
    except Exception:
        pass

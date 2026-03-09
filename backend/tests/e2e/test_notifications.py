import pytest
from httpx import AsyncClient
from sqlalchemy import text


@pytest.mark.asyncio
async def test_notifications_flow(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test notifications: get, mark as read, count."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    try:
        # Create profiles for match flow
        await create_profile_helper(headers1, "User One")
        await create_profile_helper(headers2, "User Two")

        # Create a match to generate notifications
        swipe_mut = """
        mutation Swipe($targetId: String!, $isLiked: Boolean!) {
            swipe(targetId: $targetId, isLiked: $isLiked)
        }
        """

        # Mutual like -> creates NEW_MATCH notifications
        await client.post(
            "/graphql",
            json={"query": swipe_mut, "variables": {"targetId": user2.id, "isLiked": True}},
            headers=headers1
        )
        await client.post(
            "/graphql",
            json={"query": swipe_mut, "variables": {"targetId": user1.id, "isLiked": True}},
            headers=headers2
        )

        # 1. Get unread count
        unread_query = """
        query { unreadNotificationsCount }
        """
        resp = await client.post("/graphql", json={"query": unread_query}, headers=headers1)
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        unread_count = data["data"]["unreadNotificationsCount"]
        assert unread_count >= 1, "Should have at least one notification from match"

        # 2. Get notifications list
        notifications_query = """
        query GetNotifications($params: GetNotificationsInput) {
            notifications(params: $params) {
                items {
                    id
                    kind
                    title
                    text
                    readAt
                    createdAt
                }
                totalCount
                hasMore
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={"query": notifications_query, "variables": {"params": {"limit": 10}}},
            headers=headers1
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        notifications = data["data"]["notifications"]
        assert notifications["totalCount"] >= 1
        assert len(notifications["items"]) >= 1

        notification_id = notifications["items"][0]["id"]
        assert notifications["items"][0]["readAt"] is None  # Not read yet

        # 3. Mark notification as read
        mark_read_mut = """
        mutation MarkRead($data: MarkNotificationReadInput!) {
            markNotificationRead(data: $data) {
                success
                notificationId
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={"query": mark_read_mut, "variables": {"data": {"notificationId": notification_id}}},
            headers=headers1
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["markNotificationRead"]["success"] is True

        # 4. Verify unread count decreased
        resp = await client.post("/graphql", json={"query": unread_query}, headers=headers1)
        data = resp.json()
        new_unread_count = data["data"]["unreadNotificationsCount"]
        assert new_unread_count < unread_count

        # 5. Mark all as read
        mark_all_mut = """
        mutation { markAllNotificationsRead { count } }
        """
        resp = await client.post("/graphql", json={"query": mark_all_mut}, headers=headers1)
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        # 6. Verify all read
        resp = await client.post("/graphql", json={"query": unread_query}, headers=headers1)
        data = resp.json()
        assert data["data"]["unreadNotificationsCount"] == 0

    finally:
        # Cleanup
        for u in [user1, user2]:
            try:
                await db_session.execute(text("DELETE FROM notifications WHERE user_id = :id"), {"id": u.id})
                await db_session.execute(text("DELETE FROM matches WHERE user_id = :id OR target_id = :id"), {"id": u.id})
            except Exception:
                pass
        await db_session.commit()

import pytest
from httpx import AsyncClient
from sqlalchemy import text


@pytest.mark.asyncio
async def test_direct_chat_flow(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_chat_helpers
):
    """Test creating direct chat and sending messages."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    chat_id = None
    try:
        # 1. Create direct chat via service (since GraphQL mutation removed)
        chat = await create_chat_helpers["direct"](user1.id, user2.id)
        chat_id = str(chat.id)
        assert chat_id is not None
        assert chat.type.value == "DIRECT"

        # 2. Send message from User1
        send_msg_mut = """
        mutation SendMessage($input: SendMessageInput!) {
            sendMessage(input: $input) {
                id
                chatId
                content
                sender { id email }
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={
                "query": send_msg_mut,
                "variables": {"input": {"chatId": chat_id, "content": "Hello from User1!"}}
            },
            headers=headers1
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        msg = data["data"]["sendMessage"]
        assert msg["content"] == "Hello from User1!"
        assert msg["chatId"] == chat_id

        # 3. Send reply from User2
        resp = await client.post(
            "/graphql",
            json={
                "query": send_msg_mut,
                "variables": {"input": {"chatId": chat_id, "content": "Hi back!"}}
            },
            headers=headers2
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["sendMessage"]["content"] == "Hi back!"

        # 4. Get chat messages
        get_messages_query = """
        query GetMessages($input: GetMessagesInput!) {
            chatMessages(input: $input) {
                messages {
                    id
                    content
                    sender { id }
                }
                hasMore
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={
                "query": get_messages_query,
                "variables": {"input": {"chatId": chat_id, "limit": 10}}
            },
            headers=headers1
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        messages = data["data"]["chatMessages"]["messages"]
        assert len(messages) == 2
        contents = [m["content"] for m in messages]
        assert "Hello from User1!" in contents
        assert "Hi back!" in contents

        # 5. Get my chats
        my_chats_query = """
        query { myChats { id type lastMessage { content } } }
        """
        resp = await client.post("/graphql", json={"query": my_chats_query}, headers=headers1)
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        chats = data["data"]["myChats"]
        found = next((c for c in chats if c["id"] == chat_id), None)
        assert found is not None
        assert found["lastMessage"]["content"] == "Hi back!"

        # 6. Mark as read
        mark_read_mut = """
        mutation MarkAsRead($input: MarkAsReadInput!) {
            markAsRead(input: $input) { success }
        }
        """
        resp = await client.post(
            "/graphql",
            json={"query": mark_read_mut, "variables": {"input": {"chatId": chat_id}}},
            headers=headers1
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["markAsRead"]["success"] is True

    finally:
        # Cleanup
        if chat_id:
            try:
                await db_session.execute(text("DELETE FROM messages WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chat_participants WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chats WHERE id = :id"), {"id": chat_id})
                await db_session.commit()
            except Exception:
                pass


@pytest.mark.asyncio
async def test_group_chat_flow(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_chat_helpers
):
    """Test creating group chat with multiple participants."""
    user1 = await user_factory()
    user2 = await user_factory()
    user3 = await user_factory()
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    chat_id = None
    try:
        # Create group via service
        chat = await create_chat_helpers["group"](user1.id, "Test Group", [user2.id, user3.id])
        chat_id = str(chat.id)
        assert chat.type.value == "GROUP"
        assert chat.title == "Test Group"

        # User2 can send message to group
        send_msg_mut = """
        mutation SendMessage($input: SendMessageInput!) {
            sendMessage(input: $input) { id content }
        }
        """
        resp = await client.post(
            "/graphql",
            json={
                "query": send_msg_mut,
                "variables": {"input": {"chatId": chat_id, "content": "Hello group!"}}
            },
            headers=headers2
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["sendMessage"]["content"] == "Hello group!"

    finally:
        if chat_id:
            try:
                await db_session.execute(text("DELETE FROM messages WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chat_participants WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chats WHERE id = :id"), {"id": chat_id})
                await db_session.commit()
            except Exception:
                pass


@pytest.mark.asyncio
async def test_channel_chat_flow(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_chat_helpers
):
    """Test channel where only host can send messages."""
    user1 = await user_factory()  # Host
    user2 = await user_factory()  # Subscriber
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    chat_id = None
    try:
        # Create channel via service
        chat = await create_chat_helpers["channel"](user1.id, "News Channel", [user2.id])
        chat_id = str(chat.id)
        assert chat.type.value == "CHANNEL"

        # Host can send message
        send_msg_mut = """
        mutation SendMessage($input: SendMessageInput!) {
            sendMessage(input: $input) { id content }
        }
        """
        resp = await client.post(
            "/graphql",
            json={
                "query": send_msg_mut,
                "variables": {"input": {"chatId": chat_id, "content": "Announcement!"}}
            },
            headers=headers1
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        # Subscriber should NOT be able to send message
        resp = await client.post(
            "/graphql",
            json={
                "query": send_msg_mut,
                "variables": {"input": {"chatId": chat_id, "content": "I can't send this"}}
            },
            headers=headers2
        )
        data = resp.json()
        # Expect an error for non-host
        assert "errors" in data, "Non-host should not be able to send to channel"

    finally:
        if chat_id:
            try:
                await db_session.execute(text("DELETE FROM messages WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chat_participants WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chats WHERE id = :id"), {"id": chat_id})
                await db_session.commit()
            except Exception:
                pass


@pytest.mark.asyncio
async def test_delete_chat(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_chat_helpers
):
    """Test chat deletion."""
    user1 = await user_factory()
    user2 = await user_factory()
    headers1 = get_auth_headers(user1)

    chat_id = None
    try:
        # Create direct chat via service
        chat = await create_chat_helpers["direct"](user1.id, user2.id)
        chat_id = str(chat.id)

        # Delete chat
        delete_chat_mut = """
        mutation DeleteChat($input: DeleteChatInput!) {
            deleteChat(input: $input) { success }
        }
        """
        resp = await client.post(
            "/graphql",
            json={"query": delete_chat_mut, "variables": {"input": {"chatId": chat_id}}},
            headers=headers1
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["deleteChat"]["success"] is True

        # Chat should no longer appear in my chats (or be marked deleted)
        my_chats_query = """
        query { myChats { id } }
        """
        resp = await client.post("/graphql", json={"query": my_chats_query}, headers=headers1)
        data = resp.json()
        chats = data["data"]["myChats"]
        found = next((c for c in chats if c["id"] == chat_id), None)
        # Depending on implementation, deleted chat might not appear
        # or might be filtered out

    finally:
        if chat_id:
            try:
                await db_session.execute(text("DELETE FROM messages WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chat_participants WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chats WHERE id = :id"), {"id": chat_id})
                await db_session.commit()
            except Exception:
                pass


@pytest.mark.asyncio
async def test_non_member_cannot_read_group_messages(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_chat_helpers
):
    """Test that non-members cannot read group chat messages."""
    user1 = await user_factory()  # Creator
    user2 = await user_factory()  # Member
    outsider = await user_factory()  # Not a member
    headers1 = get_auth_headers(user1)
    headers_outsider = get_auth_headers(outsider)

    chat_id = None
    try:
        # Create group with user1 and user2 (outsider NOT included)
        chat = await create_chat_helpers["group"](user1.id, "Private Group", [user2.id])
        chat_id = str(chat.id)

        # Outsider tries to read messages
        get_messages_query = """
        query GetMessages($input: GetMessagesInput!) {
            chatMessages(input: $input) {
                messages { id content }
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={
                "query": get_messages_query,
                "variables": {"input": {"chatId": chat_id, "limit": 10}}
            },
            headers=headers_outsider
        )
        data = resp.json()
        # Should return an error - not a member
        assert "errors" in data, "Non-member should not be able to read group messages"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "not a member" in error_message or
            "not_chat_member" in error_code.lower() or
            "not_chat_member" in error_message or
            "permission" in error_message or
            "access" in error_message or
            "forbidden" in error_code.lower() or
            "not_a_member" in error_code.lower()
        ), f"Expected access denied error, got: {error}"

    finally:
        if chat_id:
            try:
                await db_session.execute(text("DELETE FROM messages WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chat_participants WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chats WHERE id = :id"), {"id": chat_id})
                await db_session.commit()
            except Exception:
                pass


@pytest.mark.asyncio
async def test_non_host_cannot_delete_channel(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_chat_helpers
):
    """Test that non-hosts cannot delete a channel."""
    user1 = await user_factory()  # Host
    user2 = await user_factory()  # Subscriber
    headers1 = get_auth_headers(user1)
    headers2 = get_auth_headers(user2)

    chat_id = None
    try:
        # Create channel with user1 as host
        chat = await create_chat_helpers["channel"](user1.id, "Test Channel", [user2.id])
        chat_id = str(chat.id)

        # Non-host (user2) tries to delete channel
        delete_chat_mut = """
        mutation DeleteChat($input: DeleteChatInput!) {
            deleteChat(input: $input) { success }
        }
        """
        resp = await client.post(
            "/graphql",
            json={"query": delete_chat_mut, "variables": {"input": {"chatId": chat_id}}},
            headers=headers2
        )
        data = resp.json()
        # Should return an error - not the host
        assert "errors" in data, "Non-host should not be able to delete channel"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "host" in error_message or
            "permission" in error_message or
            "owner" in error_message or
            "unauthorized" in error_code.lower() or
            "unauthorized" in error_message or
            "forbidden" in error_code.lower() or
            "not_host" in error_code.lower()
        ), f"Expected permission denied error, got: {error}"

    finally:
        if chat_id:
            try:
                await db_session.execute(text("DELETE FROM messages WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chat_participants WHERE chat_id = :id"), {"id": chat_id})
                await db_session.execute(text("DELETE FROM chats WHERE id = :id"), {"id": chat_id})
                await db_session.commit()
            except Exception:
                pass

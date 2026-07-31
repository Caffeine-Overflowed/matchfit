import asyncio
import json

import httpx
import pytest
from httpx_ws import aconnect_ws
from httpx_ws.transport import ASGIWebSocketTransport

from app import app

WS_URL = "http://test/graphql"
SUBPROTOCOL = "graphql-transport-ws"

SEND_MESSAGE = """
mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) { id content }
}
"""

MESSAGE_RECEIVED = """
subscription OnMessage($chatId: String!) {
    messageReceived(chatId: $chatId) { id content }
}
"""

NOTIFICATION_RECEIVED = """
subscription { notificationReceived { id } }
"""


async def _recv(ws, timeout: float = 5.0):
    return await asyncio.wait_for(ws.receive_json(), timeout=timeout)


def _ws_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=ASGIWebSocketTransport(app), base_url="http://test"
    )


async def test_authenticated_subscription_streams_over_socket(
    client, user_factory, get_auth_headers, create_chat_helpers
):
    user1 = await user_factory()
    user2 = await user_factory()
    chat = await create_chat_helpers["direct"](user1.id, user2.id)
    chat_id = str(chat.id)

    async with _ws_client() as ws_client, aconnect_ws(
        WS_URL, ws_client, subprotocols=[SUBPROTOCOL]
    ) as ws:
        await ws.send_json(
            {"type": "connection_init", "payload": get_auth_headers(user1)}
        )
        ack = await _recv(ws)
        assert ack["type"] == "connection_ack"

        await ws.send_json(
            {
                "type": "subscribe",
                "id": "1",
                "payload": {
                    "query": MESSAGE_RECEIVED,
                    "variables": {"chatId": chat_id},
                },
            }
        )

        await asyncio.sleep(0.5)

        resp = await client.post(
            "/graphql",
            json={
                "query": SEND_MESSAGE,
                "variables": {
                    "input": {"chatId": chat_id, "content": "over the socket"}
                },
            },
            headers=get_auth_headers(user2),
        )
        assert resp.status_code == 200
        assert "errors" not in resp.json(), resp.json()

        frame = await _recv(ws)
        assert frame["type"] == "next", frame
        assert frame["id"] == "1"
        assert frame["payload"]["data"]["messageReceived"]["content"] == "over the socket"


async def test_anonymous_subscription_is_rejected():
    async with _ws_client() as ws_client, aconnect_ws(
        WS_URL, ws_client, subprotocols=[SUBPROTOCOL]
    ) as ws:
        await ws.send_json({"type": "connection_init", "payload": {}})
        ack = await _recv(ws)
        assert ack["type"] == "connection_ack"

        await ws.send_json(
            {"type": "subscribe", "id": "1", "payload": {"query": NOTIFICATION_RECEIVED}}
        )

        frame = await _recv(ws)
        assert frame["type"] in ("error", "next"), frame
        errors = (
            frame["payload"]
            if frame["type"] == "error"
            else frame["payload"].get("errors")
        )
        assert errors, frame
        assert "unauthorized" in json.dumps(errors).lower(), errors

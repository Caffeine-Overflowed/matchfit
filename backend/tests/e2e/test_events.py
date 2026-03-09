import pytest
import json
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from sqlalchemy import text

from conftest import TestLocations


@pytest.mark.asyncio
async def test_events_flow(
    client: AsyncClient,
    user,
    auth_headers,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    event_id = None
    try:
        # 1. Setup Profile for Host
        resp = await create_profile_helper(
            auth_headers,
            "Host User",
            lat=TestLocations.BERLIN["lat"],
            lon=TestLocations.BERLIN["lon"]
        )
        assert resp.status_code == 200, resp.text
        assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

        # 2. Create Event (Host in Berlin)
        start_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        end_time = (datetime.now(timezone.utc) + timedelta(days=1, hours=2)).isoformat()

        create_event_mut = """
        mutation CreateEvent($data: CreateEventInput!) {
            createEvent(eventData: $data) {
                id
                title
                host { id }
                chat { id }
            }
        }
        """

        event_vars = {
            "data": {
                "title": "Berlin Tech Meetup",
                "description": "Networking",
                "startTime": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                "endTime": (datetime.now(timezone.utc) + timedelta(days=1, hours=2)).isoformat(),
                "maxParticipants": 50,
                "lat": 52.5200,
                "lon": 13.4050,
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFileName": None
            }
        }

        # Multipart upload for image
        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": create_event_mut, "variables": event_vars}
        map_d = {"0": ["variables.data.imageFileName"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=auth_headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        event_id = data["data"]["createEvent"]["id"]

        # 3. Create User 2 (Guest) and setup location (Nearby Berlin)
        user2 = await user_factory()
        headers2 = get_auth_headers(user2)

        resp = await create_profile_helper(
            headers2,
            "Guest User",
            lat=TestLocations.BERLIN_NEARBY["lat"],
            lon=TestLocations.BERLIN_NEARBY["lon"],
            gender="female"
        )
        assert "errors" not in resp.json(), f"Unexpected error: {resp.json().get('errors')}"

        # 4. Guest joins Event
        join_mut = """
        mutation JoinEvent($eventId: String!) {
            joinEvent(eventId: $eventId) {
                id
                title
            }
        }
        """
        resp = await client.post(
            "/graphql",
            json={"query": join_mut, "variables": {"eventId": event_id}},
            headers=headers2
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["joinEvent"]["id"] == event_id
        assert data["data"]["joinEvent"]["title"] == "Berlin Tech Meetup"

        # 5. Nearby Events
        nearby_q = """
        query Nearby {
            nearbyEvents(limit: 10) {
                event {
                    id
                    title
                }
                distanceKm
            }
        }
        """

        resp = await client.post("/graphql", json={"query": nearby_q}, headers=headers2)
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        events = data["data"]["nearbyEvents"]
        assert len(events) >= 1
        found = next((e for e in events if e["event"]["id"] == event_id), None)
        assert found is not None, f"Created event {event_id} not found in nearby events"
        assert found["event"]["title"] == "Berlin Tech Meetup"
        # User2 (52.5100, 13.4000) vs Event (52.5200, 13.4050)
        # Dist is approx 1.1 km
        assert found["distanceKm"] is not None
        assert 0 < found["distanceKm"] < 2.0  # km

    finally:
        # Cleanup: Delete event so users can be deleted in teardown
        if event_id:
            await db_session.execute(
                text("DELETE FROM event_participants WHERE event_id = :id"),
                {"id": event_id}
            )
            await db_session.execute(
                text("DELETE FROM event_sports WHERE event_id = :id"),
                {"id": event_id}
            )
            await db_session.execute(
                text("DELETE FROM events WHERE id = :id"),
                {"id": event_id}
            )
            await db_session.commit()

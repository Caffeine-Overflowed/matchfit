import pytest
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from sqlalchemy import text
import json

from conftest import TestLocations


@pytest.mark.asyncio
async def test_update_event_by_host(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test that host can update their own event."""
    host = await user_factory()
    headers = get_auth_headers(host)

    # Create profile for host
    await create_profile_helper(headers, "Host User")

    event_id = None
    try:
        # Create event
        start_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        end_time = (datetime.now(timezone.utc) + timedelta(days=1, hours=2)).isoformat()

        create_event_mut = """
        mutation CreateEvent($data: CreateEventInput!) {
            createEvent(eventData: $data) {
                id
                title
                description
            }
        }
        """

        event_vars = {
            "data": {
                "title": "Original Title",
                "description": "Original description",
                "startTime": start_time,
                "endTime": end_time,
                "maxParticipants": 10,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFileName": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": create_event_mut, "variables": event_vars}
        map_d = {"0": ["variables.data.imageFileName"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        event_id = data["data"]["createEvent"]["id"]

        # Update event
        new_start_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()

        update_event_mut = """
        mutation UpdateEvent($data: UpdateEventInput!) {
            updateEvent(eventData: $data) {
                id
                title
                description
                maxParticipants
            }
        }
        """

        update_vars = {
            "data": {
                "eventId": event_id,
                "title": "Updated Title",
                "description": "Updated description",
                "startTime": new_start_time,
                "maxParticipants": 20,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFile": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": update_event_mut, "variables": update_vars}
        map_d = {"0": ["variables.data.imageFile"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        updated_event = data["data"]["updateEvent"]
        assert updated_event["id"] == event_id
        assert updated_event["title"] == "Updated Title"
        assert updated_event["description"] == "Updated description"
        assert updated_event["maxParticipants"] == 20

    finally:
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


@pytest.mark.asyncio
async def test_update_event_by_non_host(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test that non-host cannot update someone else's event."""
    host = await user_factory()
    other_user = await user_factory()
    headers_host = get_auth_headers(host)
    headers_other = get_auth_headers(other_user)

    # Create profiles
    await create_profile_helper(headers_host, "Host User")
    await create_profile_helper(headers_other, "Other User")

    event_id = None
    try:
        # Create event as host
        start_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

        create_event_mut = """
        mutation CreateEvent($data: CreateEventInput!) {
            createEvent(eventData: $data) {
                id
                title
            }
        }
        """

        event_vars = {
            "data": {
                "title": "Host's Event",
                "startTime": start_time,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFileName": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": create_event_mut, "variables": event_vars}
        map_d = {"0": ["variables.data.imageFileName"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers_host
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        event_id = data["data"]["createEvent"]["id"]

        # Other user tries to update the event
        update_event_mut = """
        mutation UpdateEvent($data: UpdateEventInput!) {
            updateEvent(eventData: $data) {
                id
                title
            }
        }
        """

        update_vars = {
            "data": {
                "eventId": event_id,
                "title": "Hacked Title",
                "startTime": start_time,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFile": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": update_event_mut, "variables": update_vars}
        map_d = {"0": ["variables.data.imageFile"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers_other
        )
        data = resp.json()
        # Should return an error - not the host
        assert "errors" in data, "Non-host should not be able to update event"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "host" in error_message or
            "permission" in error_message or
            "owner" in error_message or
            "organizer" in error_message or
            "forbidden" in error_code.lower() or
            "not_host" in error_code.lower()
        ), f"Expected permission denied error, got: {error}"

    finally:
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


@pytest.mark.asyncio
async def test_cancel_event_by_host(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test that host can cancel their own event."""
    host = await user_factory()
    headers = get_auth_headers(host)

    # Create profile
    await create_profile_helper(headers, "Host User")

    event_id = None
    try:
        # Create event
        start_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

        create_event_mut = """
        mutation CreateEvent($data: CreateEventInput!) {
            createEvent(eventData: $data) {
                id
                title
                status
            }
        }
        """

        event_vars = {
            "data": {
                "title": "Event to Cancel",
                "startTime": start_time,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFileName": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": create_event_mut, "variables": event_vars}
        map_d = {"0": ["variables.data.imageFileName"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        event_id = data["data"]["createEvent"]["id"]

        # Cancel event
        cancel_event_mut = """
        mutation CancelEvent($eventId: String!) {
            cancelEvent(eventId: $eventId) {
                id
                status
            }
        }
        """

        resp = await client.post(
            "/graphql",
            json={"query": cancel_event_mut, "variables": {"eventId": event_id}},
            headers=headers
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"

        cancelled_event = data["data"]["cancelEvent"]
        assert cancelled_event["id"] == event_id
        assert cancelled_event["status"] == "CANCELLED"

    finally:
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


@pytest.mark.asyncio
async def test_cancel_event_by_non_host(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test that non-host cannot cancel someone else's event."""
    host = await user_factory()
    other_user = await user_factory()
    headers_host = get_auth_headers(host)
    headers_other = get_auth_headers(other_user)

    # Create profiles
    await create_profile_helper(headers_host, "Host User")
    await create_profile_helper(headers_other, "Other User")

    event_id = None
    try:
        # Create event as host
        start_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

        create_event_mut = """
        mutation CreateEvent($data: CreateEventInput!) {
            createEvent(eventData: $data) {
                id
            }
        }
        """

        event_vars = {
            "data": {
                "title": "Host's Event",
                "startTime": start_time,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFileName": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": create_event_mut, "variables": event_vars}
        map_d = {"0": ["variables.data.imageFileName"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers_host
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        event_id = data["data"]["createEvent"]["id"]

        # Other user tries to cancel the event
        cancel_event_mut = """
        mutation CancelEvent($eventId: String!) {
            cancelEvent(eventId: $eventId) {
                id
                status
            }
        }
        """

        resp = await client.post(
            "/graphql",
            json={"query": cancel_event_mut, "variables": {"eventId": event_id}},
            headers=headers_other
        )
        data = resp.json()
        # Should return an error - not the host
        assert "errors" in data, "Non-host should not be able to cancel event"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "host" in error_message or
            "permission" in error_message or
            "owner" in error_message or
            "organizer" in error_message or
            "forbidden" in error_code.lower() or
            "not_host" in error_code.lower()
        ), f"Expected permission denied error, got: {error}"

    finally:
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


@pytest.mark.asyncio
async def test_join_cancelled_event(
    client: AsyncClient,
    user_factory,
    get_auth_headers,
    db_session,
    create_profile_helper
):
    """Test that users cannot join a cancelled event."""
    host = await user_factory()
    guest = await user_factory()
    headers_host = get_auth_headers(host)
    headers_guest = get_auth_headers(guest)

    # Create profiles
    await create_profile_helper(headers_host, "Host User")
    await create_profile_helper(headers_guest, "Guest User")

    event_id = None
    try:
        # Create and cancel event
        start_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

        create_event_mut = """
        mutation CreateEvent($data: CreateEventInput!) {
            createEvent(eventData: $data) {
                id
            }
        }
        """

        event_vars = {
            "data": {
                "title": "Event to Cancel",
                "startTime": start_time,
                "lat": TestLocations.BERLIN["lat"],
                "lon": TestLocations.BERLIN["lon"],
                "privacy": "PUBLIC",
                "chatType": "GROUP",
                "imageFileName": None
            }
        }

        files = {"0": ("event.jpg", b"fake_image", "image/jpeg")}
        ops = {"query": create_event_mut, "variables": event_vars}
        map_d = {"0": ["variables.data.imageFileName"]}

        resp = await client.post(
            "/graphql",
            data={"operations": json.dumps(ops), "map": json.dumps(map_d)},
            files=files,
            headers=headers_host
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        event_id = data["data"]["createEvent"]["id"]

        # Host cancels the event
        cancel_event_mut = """
        mutation CancelEvent($eventId: String!) {
            cancelEvent(eventId: $eventId) {
                id
                status
            }
        }
        """

        resp = await client.post(
            "/graphql",
            json={"query": cancel_event_mut, "variables": {"eventId": event_id}},
            headers=headers_host
        )
        data = resp.json()
        assert "errors" not in data, f"Unexpected error: {data.get('errors')}"
        assert data["data"]["cancelEvent"]["status"] == "CANCELLED"

        # Guest tries to join cancelled event
        join_event_mut = """
        mutation JoinEvent($eventId: String!) {
            joinEvent(eventId: $eventId) {
                id
            }
        }
        """

        resp = await client.post(
            "/graphql",
            json={"query": join_event_mut, "variables": {"eventId": event_id}},
            headers=headers_guest
        )
        data = resp.json()
        # Should return an error - event is cancelled
        assert "errors" in data, "Should not be able to join cancelled event"
        error = data["errors"][0]
        error_code = error.get("extensions", {}).get("code", "")
        error_message = error.get("message", "").lower()
        assert (
            "cancelled" in error_message or
            "cancel" in error_message or
            "not available" in error_message or
            "event_cancelled" in error_code.lower() or
            "event_already_cancelled" in error_code.lower() or
            "event_already_cancelled" in error_message or
            "cannot join" in error_message
        ), f"Expected cancelled event error, got: {error}"

    finally:
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

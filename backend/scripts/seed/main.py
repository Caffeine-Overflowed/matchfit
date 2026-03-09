#!/usr/bin/env python3
"""
Seed script for test data.

Usage:
    python -m scripts.seed.main              # Seed test data (users, events, etc.)
    python -m scripts.seed.main --clean      # Clean and recreate test data
    python -m scripts.seed.main --reference  # Seed reference data (sports, goals, translations)
    python -m scripts.seed.main --all        # Seed both reference and test data
"""
import argparse
import asyncio
import base64
import random
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import httpx
from sqlalchemy import select, text

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.config import Config
from app.extensions.enums.chat_enums import ChatKind
from app.extensions.enums.event_enums import (
    DifficultyLevel,
    EventCategory,
    EventPrivacy,
    EventStatus,
    ParticipantRole,
    ParticipantStatus,
)
from app.extensions.enums.profile_enums import Chronotype
from app.models.chat import Chat
from app.models.chat_participation import ChatParticipation
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.models.goal import Goal
from app.models.match import Match
from app.models.message import Message
from app.models.profile import Profile
from app.models.sport import Sport
from app.models.user import User
from app.services.avatar_service import AvatarService
from app.utils.database import Database
from app.utils.minio import MinioFolder, MinioService

from .data import (
    EVENT_MESSAGES,
    GOALS_DATA,
    GOALS_DEFAULT_ICON,
    MATCH_MESSAGES,
    MUTUAL_MATCHES,
    ONE_SIDED_LIKES,
    SEED_EVENTS,
    SEED_USERS,
    SPORTS_DATA,
    SPORTS_DEFAULT_ICON,
    TRANSLATIONS_DATA,
)

ASSETS_DIR = Path(__file__).parent / "assets" / "avatars"
EVENT_IMAGES_DIR = Path(__file__).parent / "assets" / "event_images"
STATIC_DIR = Path(__file__).parent.parent.parent / "alembic" / "static"


def make_point(lat: float, lon: float) -> str:
    """Create PostGIS point WKT."""
    return f"SRID=4326;POINT({lon} {lat})"


async def upload_avatars_to_minio():
    """Upload all avatars to MinIO."""
    for user in SEED_USERS:
        # Extract filename from avatar_url path
        avatar_url = user.get("avatar_url", "")
        if not avatar_url:
            continue

        # Get just the filename from the path
        source_filename = Path(avatar_url).name  # e.g., "Abigail.png"
        avatar_path = ASSETS_DIR / source_filename

        if avatar_path.exists():
            # Use user id as the target filename
            ext = source_filename.split(".")[-1] if "." in source_filename else "png"
            avatar_name = f"{user['id']}.{ext}"
            try:
                try:
                    await MinioService.delete_object(
                        folder=MinioFolder.AVATARS,
                        object_name=avatar_name,
                    )
                except Exception:
                    pass
                await MinioService.upload_object(
                    folder=MinioFolder.AVATARS,
                    object_name=avatar_name,
                    file=avatar_path.read_bytes(),
                )
                print(f"  Uploaded avatar: {source_filename} -> {avatar_name}")
            except Exception as e:
                print(f"  WARNING: Failed to upload {avatar_name}: {e}")
        else:
            print(f"  WARNING: Avatar file not found: {avatar_path}")


async def upload_event_images_to_minio() -> dict[str, str]:
    """Upload all event images to MinIO. Returns mapping of event_id -> uploaded filename."""
    uploaded_images = {}

    for event in SEED_EVENTS:
        image_path_str = event.get("image_file_name", "")
        if not image_path_str:
            continue

        # Get just the filename from the path
        source_filename = Path(image_path_str).name  # e.g., "park.png"

        # Try both .png and .jpg extensions
        image_path = EVENT_IMAGES_DIR / source_filename
        if not image_path.exists():
            # Try alternative extension
            base_name = source_filename.rsplit(".", 1)[0]
            for ext in ["png", "jpg", "jpeg"]:
                alt_path = EVENT_IMAGES_DIR / f"{base_name}.{ext}"
                if alt_path.exists():
                    image_path = alt_path
                    source_filename = f"{base_name}.{ext}"
                    break

        if image_path.exists():
            # Use event id as the target filename
            ext = source_filename.split(".")[-1] if "." in source_filename else "png"
            image_name = f"{event['id']}.{ext}"
            try:
                try:
                    await MinioService.delete_object(
                        folder=MinioFolder.EVENT_IMAGES,
                        object_name=image_name,
                    )
                except Exception:
                    pass
                await MinioService.upload_object(
                    folder=MinioFolder.EVENT_IMAGES,
                    object_name=image_name,
                    file=image_path.read_bytes(),
                )
                uploaded_images[event["id"]] = image_name
                print(f"  Uploaded event image: {source_filename} -> {image_name}")
            except Exception as e:
                print(f"  WARNING: Failed to upload {image_name}: {e}")
        else:
            print(f"  WARNING: Event image not found: {image_path}")

    return uploaded_images


async def check_existing_seed_data(session) -> bool:
    """Check if seed data already exists."""
    result = await session.execute(
        text("SELECT id FROM users WHERE id LIKE 'seed-user-%' LIMIT 1")
    )
    return result.scalar_one_or_none() is not None


# move to other file?
async def clean_seed_data(session):
    """Remove all seed data (in reverse order of dependencies)."""
    print("Cleaning existing seed data...")

    # Order matters due to FK constraints
    # 1. Messages first (references chats and users)
    await session.execute(
        text("DELETE FROM messages WHERE sender_id LIKE 'seed-user-%' OR chat_id LIKE 'seed-chat-%'")
    )
    # 2. Event participants (references events and users)
    await session.execute(
        text("DELETE FROM event_participants WHERE user_id LIKE 'seed-user-%' OR event_id LIKE 'seed-event-%'")
    )
    # 3. Event sports (references events)
    await session.execute(
        text("DELETE FROM event_sports WHERE event_id LIKE 'seed-event-%'")
    )
    # 4. Events (references users and chats)
    await session.execute(
        text("DELETE FROM events WHERE id LIKE 'seed-event-%'")
    )
    # 5. Matches (references users and chats)
    await session.execute(
        text("DELETE FROM matches WHERE id LIKE 'seed-match-%' OR user_id LIKE 'seed-user-%' OR target_id LIKE 'seed-user-%'")
    )
    # 6. Chat participations (references chats and users)
    await session.execute(
        text("DELETE FROM chat_participations WHERE user_id LIKE 'seed-user-%' OR chat_id LIKE 'seed-chat-%'")
    )
    # 7. Chats
    await session.execute(
        text("DELETE FROM chats WHERE id LIKE 'seed-chat-%'")
    )
    # 8. Profile sports/goals (references profiles)
    await session.execute(
        text("DELETE FROM profile_sports WHERE profile_id LIKE 'seed-user-%'")
    )
    await session.execute(
        text("DELETE FROM profile_goals WHERE profile_id LIKE 'seed-user-%'")
    )
    # 9. Profiles (references users)
    await session.execute(
        text("DELETE FROM profiles WHERE user_id LIKE 'seed-user-%'")
    )
    # 10. Users last
    await session.execute(
        text("DELETE FROM users WHERE id LIKE 'seed-user-%'")
    )

    print("  Seed data cleaned.")


# do we need it?
def svg_to_base64(filepath: Path, default: str) -> str:
    """Read SVG file and return base64 data URI."""
    if not filepath.exists():
        return default
    try:
        svg_content = filepath.read_bytes()
        b64 = base64.b64encode(svg_content).decode("utf-8")
        return f"data:image/svg+xml;base64,{b64}"
    except Exception:
        return default


async def seed_sports(session):
    """Seed sports reference data."""
    print("Seeding sports...")

    # Check if sports already exist
    result = await session.execute(select(Sport).limit(1))
    if result.scalar_one_or_none():
        print("  Sports already exist, skipping.")
        return

    sports_dir = STATIC_DIR / "sports"
    for item in SPORTS_DATA:
        icon_path = sports_dir / item["icon_file"]
        icon_url = svg_to_base64(icon_path, SPORTS_DEFAULT_ICON)

        sport = Sport(name=item["name"], icon_url=icon_url)
        session.add(sport)

    await session.flush()
    print(f"  Total: {len(SPORTS_DATA)} sports created.")


async def seed_goals(session):
    """Seed goals reference data."""
    print("Seeding goals...")

    # Check if goals already exist
    result = await session.execute(select(Goal).limit(1))
    if result.scalar_one_or_none():
        print("  Goals already exist, skipping.")
        return

    goals_dir = STATIC_DIR / "goals"
    for item in GOALS_DATA:
        icon_path = goals_dir / item["icon_file"]
        icon_url = svg_to_base64(icon_path, GOALS_DEFAULT_ICON)

        goal = Goal(
            name=item["name"],
            description=item["description"],
            icon_url=icon_url,
        )
        session.add(goal)

    await session.flush()
    print(f"  Total: {len(GOALS_DATA)} goals created.")


async def seed_translations(session):
    """Seed translations reference data."""
    print("Seeding translations...")

    # Check if translations already exist
    result = await session.execute(
        text("SELECT id FROM translations LIMIT 1")
    )
    if result.scalar_one_or_none():
        print("  Translations already exist, skipping.")
        return

    for entity_type, key, locale, value in TRANSLATIONS_DATA:
        await session.execute(
            text("""
                INSERT INTO translations (entity_type, key, locale, value)
                VALUES (:entity_type, :key, :locale, :value)
                ON CONFLICT (entity_type, key, locale) DO NOTHING
            """),
            {
                "entity_type": entity_type,
                "key": key,
                "locale": locale,
                "value": value,
            },
        )

    await session.flush()
    print(f"  Total: {len(TRANSLATIONS_DATA)} translations created.")


async def seed_reference_data(session):
    """Seed all reference data (sports, goals, translations)."""
    await seed_sports(session)
    await seed_goals(session)
    await seed_translations(session)


async def seed_users(session):
    """Create users with profiles."""
    print("Creating users and profiles...")

    # Load sports and goals for mapping
    sports_result = await session.execute(select(Sport))
    sports_by_name = {s.name: s for s in sports_result.scalars().all()}

    goals_result = await session.execute(select(Goal))
    goals_by_name = {g.name: g for g in goals_result.scalars().all()}

    for data in SEED_USERS:
        # Create user
        # Bcrypt hash of 'T3$tT3$t'
        user = User(
            id=data["id"],
            email=data["email"],
            password_hash='$2b$12$5B4AW9mtylFBdQ0gHDXgiu3JTXAkbGxe9/tQlWBls8NcQCVujT0qe',
        )
        session.add(user)
        await session.flush()

        # Map sports and goals
        user_sports = [
            sports_by_name[name]
            for name in data["sports"]
            if name in sports_by_name
        ]
        user_goals = [
            goals_by_name[name]
            for name in data["goals"]
            if name in goals_by_name
        ]

        # Get avatar extension from avatar_url
        avatar_url = data.get("avatar_url", "")
        avatar_ext = Path(avatar_url).suffix if avatar_url else ".png"

        # Create profile
        profile = Profile(
            user_id=data["id"],
            avatar_pic_name=f"{data['id']}{avatar_ext}",
            name=data["name"],
            birthdate=date(
                year=data["birth_year"],
                month=data["birth_month"],
                day=data["birth_day"],
            ),
            weight=data.get("weight"),
            height=data.get("height"),
            gender=data["gender"],
            bio=data.get("bio", ""),
            languages=data.get("languages", []),
            location=make_point(
                data["location"]["lat"],
                data["location"]["lon"],
            ),
            location_name=data["location"]["name"],
            sports=user_sports,
            goals=user_goals,
            chronotype=random.choice(list(Chronotype)),
        )
        session.add(profile)
        print(f"  Created user: {data['name']}")

    await session.flush()
    print(f"  Total: {len(SEED_USERS)} users created.")


async def seed_matches(session):
    """Create matches and direct chats."""
    print("Creating matches...")

    # Create mutual matches with chats
    for match_data in MUTUAL_MATCHES:
        # Create direct chat
        chat = Chat(
            id=match_data["chat_id"],
            type=ChatKind.DIRECT,
            title=None,
        )
        session.add(chat)
        await session.flush()

        # Add chat participations
        cp1 = ChatParticipation(
            id=f"{match_data['chat_id']}-p1",
            chat_id=match_data["chat_id"],
            user_id=match_data["user_id"],
            is_host=False,
        )
        cp2 = ChatParticipation(
            id=f"{match_data['chat_id']}-p2",
            chat_id=match_data["chat_id"],
            user_id=match_data["target_id"],
            is_host=False,
        )
        session.add(cp1)
        session.add(cp2)

        system_message = Message(
            id=f"{match_data['chat_id']}-msg-000",
            chat_id=match_data["chat_id"],
            sender_id=match_data["user_id"],  # System messages still need a sender
            content="You have a new match! Start chatting now.",
            sent_at=datetime.now(timezone.utc),
            is_system=True,
        )
        session.add(system_message)
        await session.flush()


        # Create match
        match = Match(
            id=match_data["id"],
            user_id=match_data["user_id"],
            target_id=match_data["target_id"],
            chat_id=match_data["chat_id"],
            is_match=True,
        )
        session.add(match)
        print(f"  Mutual match: {match_data['user_id']} <-> {match_data['target_id']}")

    # Create one-sided likes (no chat)
    for like_data in ONE_SIDED_LIKES:
        match = Match(
            id=like_data["id"],
            user_id=like_data["user_id"],
            target_id=like_data["target_id"],
            chat_id=None,
            is_match=False,
        )
        session.add(match)

    await session.flush()
    print(f"  Total: {len(MUTUAL_MATCHES)} mutual, {len(ONE_SIDED_LIKES)} one-sided.")


async def seed_events(session, uploaded_images: dict[str, str]):
    """Create events with participants."""
    print("Creating events...")

    # Load sports for mapping
    sports_result = await session.execute(select(Sport))
    sports_by_name = {s.name: s for s in sports_result.scalars().all()}

    now = datetime.now(timezone.utc)

    for event_data in SEED_EVENTS:
        # Calculate event times
        start_time = now + timedelta(days=event_data["offset_days"])
        end_time = start_time + timedelta(hours=event_data["duration_hours"])

        # Create chat for event
        chat_id = f"seed-chat-event-{event_data['id'].split('-')[-1]}"
        chat_avatar = await AvatarService.generate_chat_avatar(event_data["title"])

        chat = Chat(
            id=chat_id,
            type=ChatKind.GROUP,
            title=event_data["title"],
            image_file_name=chat_avatar,
        )
        session.add(chat)
        await session.flush()

        system_message = Message(
            id=f"{chat_id}-msg-000",
            chat_id=chat_id,
            sender_id=event_data["host_id"],  # System messages still need a sender
            content=f"Welcome to {event_data['title']}! The host will share more details soon.",
            sent_at=datetime.now(timezone.utc),
            is_system=True,
        )
        session.add(system_message)
        await session.flush()

        # Map sports
        event_sports = [
            sports_by_name[name]
            for name in event_data["sports"]
            if name in sports_by_name
        ]

        # Get uploaded image filename or use default
        event_image_name = uploaded_images.get(event_data["id"], "default_event_image.svg")

        # Create event
        event = Event(
            id=event_data["id"],
            host_id=event_data["host_id"],
            title=event_data["title"],
            description=event_data["description"],
            category=EventCategory[event_data["category"]],
            image_file_name=event_image_name,
            difficulty=DifficultyLevel[event_data["difficulty"]],
            privacy=EventPrivacy[event_data["privacy"]],
            start_time=start_time,
            end_time=end_time,
            location=make_point(
                event_data["location"]["lat"],
                event_data["location"]["lon"],
            ),
            target_participants=event_data.get("target_participants"),
            max_participants=event_data.get("max_participants"),
            status=EventStatus.SCHEDULED,
            chat_id=chat_id,
            sports=event_sports,
        )
        session.add(event)
        await session.flush()

        # Add host as participant
        host_participant = EventParticipant(
            event_id=event_data["id"],
            user_id=event_data["host_id"],
            role=ParticipantRole.HOST,
            status=ParticipantStatus.ACTIVE,
        )
        session.add(host_participant)

        # Add host to chat
        host_chat_participation = ChatParticipation(
            id=f"{chat_id}-host",
            chat_id=chat_id,
            user_id=event_data["host_id"],
            is_host=True,
        )
        session.add(host_chat_participation)

        # Add other participants
        for i, participant_id in enumerate(event_data.get("participants", [])):
            participant = EventParticipant(
                event_id=event_data["id"],
                user_id=participant_id,
                role=ParticipantRole.MEMBER,
                status=ParticipantStatus.ACTIVE,
            )
            session.add(participant)

            # Add to chat
            chat_participation = ChatParticipation(
                id=f"{chat_id}-p{i}",
                chat_id=chat_id,
                user_id=participant_id,
                is_host=False,
            )
            session.add(chat_participation)

        print(f"  Created event: {event_data['title']}")

    await session.flush()
    print(f"  Total: {len(SEED_EVENTS)} events created.")


async def seed_messages(session):
    """Create messages in chats."""
    print("Creating messages...")

    msg_count = 0
    base_time = datetime.now(timezone.utc) - timedelta(hours=24)

    # Messages in match chats
    for chat_id, messages in MATCH_MESSAGES.items():
        # Get match to determine user_id and target_id
        match_data = next(
            (m for m in MUTUAL_MATCHES if m["chat_id"] == chat_id),
            None,
        )
        if not match_data:
            continue

        users = [match_data["user_id"], match_data["target_id"]]

        for i, (sender_idx, content) in enumerate(messages, start=1):  # Start from 1, 000 is system msg
            msg = Message(
                id=f"{chat_id}-msg-{i:03d}",
                chat_id=chat_id,
                sender_id=users[sender_idx],
                content=content,
                sent_at=base_time + timedelta(minutes=i * 5),
                is_system=False,
            )
            session.add(msg)
            msg_count += 1

    # Messages in event chats
    for event_id, messages in EVENT_MESSAGES.items():
        chat_id = f"seed-chat-event-{event_id.split('-')[-1]}"

        for i, (sender, content) in enumerate(messages, start=1):  # Start from 1, 000 is system msg
            is_system = sender == "system"
            sender_id = (
                SEED_EVENTS[0]["host_id"] if is_system
                else sender
            )

            msg = Message(
                id=f"{chat_id}-msg-{i:03d}",
                chat_id=chat_id,
                sender_id=sender_id,
                content=content,
                sent_at=base_time + timedelta(minutes=i * 10),
                is_system=is_system,
            )
            session.add(msg)
            msg_count += 1

    await session.flush()
    print(f"  Total: {msg_count} messages created.")


async def main(clean: bool = False, reference: bool = False, test_data: bool = True):
    """Main seeding function."""
    print("=" * 50)
    print("SEED DATA SCRIPT")
    print("=" * 50)

    # 1. Initialize database
    print("\n[1/6] Initializing database...")
    await Database.init()

    # 2. Seed reference data if requested
    if reference:
        print("\n[2/6] Seeding reference data...")
        async with Database.get_session() as session:
            await seed_reference_data(session)
    else:
        print("\n[2/6] Skipping reference data (use --reference or --all)")

    if not test_data:
        print("\n" + "=" * 50)
        print("REFERENCE DATA SEED COMPLETED!")
        print("=" * 50)
        return

    async with Database.get_session() as session:
        # 4. Check/clean existing data
        print("\n[4/6] Checking existing data...")
        if await check_existing_seed_data(session):
            if clean:
                await clean_seed_data(session)
            else:
                print("  Seed data already exists. Use --clean to recreate.")
                print("=" * 50)
                return

        # 5. Upload images to MinIO
        print("\n[5/6] Uploading images to MinIO...")
        await upload_avatars_to_minio()
        uploaded_event_images = await upload_event_images_to_minio()

        # 6. Create seed data in order
        print("\n[6/6] Creating seed data...")
        await seed_users(session)
        await seed_matches(session)
        await seed_events(session, uploaded_event_images)
        await seed_messages(session)

        # Commit is automatic via context manager

    print("\nVerifying...")
    async with Database.get_session() as session:
        users_count = (await session.execute(
            text("SELECT COUNT(*) FROM users WHERE id LIKE 'seed-user-%'")
        )).scalar()
        events_count = (await session.execute(
            text("SELECT COUNT(*) FROM events WHERE id LIKE 'seed-event-%'")
        )).scalar()
        matches_count = (await session.execute(
            text("SELECT COUNT(*) FROM matches WHERE id LIKE 'seed-match-%'")
        )).scalar()
        messages_count = (await session.execute(
            text("SELECT COUNT(*) FROM messages WHERE id LIKE 'seed-chat-%'")
        )).scalar()

        print(f"  Users: {users_count}")
        print(f"  Events: {events_count}")
        print(f"  Matches: {matches_count}")
        print(f"  Messages: {messages_count}")

    print("\n" + "=" * 50)
    print("SEED COMPLETED SUCCESSFULLY!")
    print("=" * 50)


def cli():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Seed database with test data")
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Clean existing test seed data before creating new",
    )
    parser.add_argument(
        "--reference",
        action="store_true",
        help="Seed reference data only (sports, goals, translations)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Seed both reference and test data",
    )
    args = parser.parse_args()

    # Determine what to seed
    if args.reference and not args.all:
        # Only reference data
        asyncio.run(main(clean=False, reference=True, test_data=False))
    elif args.all:
        # Both reference and test data
        asyncio.run(main(clean=args.clean, reference=True, test_data=True))
    else:
        # Default: test data only
        asyncio.run(main(clean=args.clean, reference=False, test_data=True))


if __name__ == "__main__":
    cli()

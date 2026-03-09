"""Seed data for matches."""

# Mutual matches - both users liked each other, chat will be created
MUTUAL_MATCHES = [
    {
        "id": "seed-match-001",
        "user_id": "seed-user-001",
        "target_id": "seed-user-002",
        "chat_id": "seed-chat-match-001",
    },
    {
        "id": "seed-match-002",
        "user_id": "seed-user-003",
        "target_id": "seed-user-006",
        "chat_id": "seed-chat-match-002",
    },
    {
        "id": "seed-match-003",
        "user_id": "seed-user-004",
        "target_id": "seed-user-005",
        "chat_id": "seed-chat-match-003",
    },
    {
        "id": "seed-match-004",
        "user_id": "seed-user-007",
        "target_id": "seed-user-008",
        "chat_id": "seed-chat-match-004",
    },
    {
        "id": "seed-match-005",
        "user_id": "seed-user-009",
        "target_id": "seed-user-010",
        "chat_id": "seed-chat-match-005",
    },
]

# One-sided likes - only one user liked, no chat created
ONE_SIDED_LIKES = [
    {
        "id": "seed-match-006",
        "user_id": "seed-user-011",
        "target_id": "seed-user-002",
    },
    {
        "id": "seed-match-007",
        "user_id": "seed-user-012",
        "target_id": "seed-user-003",
    },
    {
        "id": "seed-match-008",
        "user_id": "seed-user-013",
        "target_id": "seed-user-004",
    },
    {
        "id": "seed-match-009",
        "user_id": "seed-user-014",
        "target_id": "seed-user-007",
    },
    {
        "id": "seed-match-010",
        "user_id": "seed-user-015",
        "target_id": "seed-user-008",
    },
    {
        "id": "seed-match-011",
        "user_id": "seed-user-001",
        "target_id": "seed-user-012",
    },
    {
        "id": "seed-match-012",
        "user_id": "seed-user-006",
        "target_id": "seed-user-011",
    },
    {
        "id": "seed-match-013",
        "user_id": "seed-user-010",
        "target_id": "seed-user-015",
    },
]

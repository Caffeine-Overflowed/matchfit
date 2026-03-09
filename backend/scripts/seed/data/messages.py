"""Seed data for messages."""

# Messages for mutual match chats
# Each entry: (sender_index, message) where sender_index 0=user_id, 1=target_id
MATCH_MESSAGES = {
    "seed-chat-match-001": [
        (0, "Hi Maria! I saw you're into yoga and swimming. I'm training for a marathon and looking for cross-training partners."),
        (1, "Hey Alex! That's great! Yoga is perfect for runners - helps with flexibility and recovery."),
        (0, "Exactly what I was thinking! Do you have any group yoga sessions coming up?"),
        (1, "Yes! I'm hosting a beginners session this week. You should join!"),
        (0, "Count me in! What should I bring?"),
    ],
    "seed-chat-match-002": [
        (0, "Hey Anna! I noticed you're into hiking. I'm looking for workout partners too."),
        (1, "Hi Max! Yes, I love hiking on weekends. Do you hike as well?"),
        (0, "Not much hiking, but I'd love to try! I'm more into gym and boxing."),
        (1, "That's cool! Maybe we can do a hike that includes some fitness challenges?"),
    ],
    "seed-chat-match-003": [
        (0, "Hi Ivan! Tennis player here. Do you play any racket sports?"),
        (1, "Hey Elena! I mainly play basketball and football, but I've always wanted to try tennis!"),
        (0, "Would you like to learn? I can teach you the basics."),
        (1, "That would be awesome! When are you free?"),
        (0, "How about this Saturday morning?"),
    ],
    "seed-chat-match-004": [
        (0, "Olga! Fellow swimmer here. I'm also into martial arts."),
        (1, "Hi Sergey! Swimming and martial arts - that's an interesting combo!"),
        (0, "Great for overall fitness. How often do you swim?"),
        (1, "3-4 times a week. I'm training for a triathlon."),
        (0, "Impressive! Let me know if you need any strength training tips."),
    ],
    "seed-chat-match-005": [
        (0, "Hey Tatiana! I see you play volleyball. I'm more of a winter sports person."),
        (1, "Hi Nikolai! Skiing and snowboarding look so fun! I've never tried."),
        (0, "You should! There's a trip to Rosa Khutor coming up."),
        (1, "Sounds exciting! Is it beginner-friendly?"),
        (0, "Absolutely! We can start on easy slopes."),
    ],
}

# Messages for event chats
# First message is always a system welcome message
EVENT_MESSAGES = {
    "seed-event-001": [
        ("system", "Welcome to Morning Run in Gorky Park! The host will share more details soon."),
        ("seed-user-001", "Hey everyone! Excited for our morning run. Meet at the main entrance at 7 AM."),
        ("seed-user-008", "I'll be there! Should we bring water?"),
        ("seed-user-001", "Yes, bring water. We'll have a short break at the halfway point."),
    ],
    "seed-event-003": [
        ("system", "Welcome to Yoga Session for Beginners! The host will share more details soon."),
        ("seed-user-002", "Namaste everyone! Looking forward to our session. Mats will be provided."),
        ("seed-user-006", "Can't wait! Do we need to wear anything specific?"),
        ("seed-user-002", "Comfortable stretchy clothes are perfect. See you there!"),
    ],
    "seed-event-007": [
        ("system", "Welcome to Swimming Techniques Workshop! The host will share more details soon."),
        ("seed-user-008", "Hi swimmers! We'll focus on freestyle technique this session."),
        ("seed-user-011", "Looking forward to it! Any tips for preparation?"),
        ("seed-user-008", "Just come ready to swim! We'll warm up together."),
    ],
    "seed-event-008": [
        ("system", "Welcome to Basketball 3x3 Game! The host will share more details soon."),
        ("seed-user-005", "Game on! Who's ready for some hoops?"),
        ("seed-user-015", "Let's go! I'll bring an extra ball."),
    ],
    "seed-event-012": [
        ("system", "Welcome to Martial Arts Introduction! The host will share more details soon."),
        ("seed-user-007", "Welcome to MMA basics! No experience needed, just enthusiasm."),
        ("seed-user-003", "I train boxing, excited to learn some ground work!"),
        ("seed-user-007", "Perfect! We'll cover both striking and grappling basics."),
    ],
}

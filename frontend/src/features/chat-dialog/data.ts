import type { ChatInfo, MessagesGroup } from "./types";

export const MOCK_CHAT_INFO: ChatInfo = {
    id: "1",
    name: "Travelers Group",
    avatar: "/avatars/group.jpg",
    participantsCount: 4,
    isGroup: true,
};

export const MOCK_MESSAGES: MessagesGroup[] = [
    {
        date: "01/14/2025",
        messages: [
            {
                id: "1",
                text: "Hi everyone! Who's coming to the next meetup?",
                time: "10:30",
                senderId: "u1",
                senderName: "Anna",
                senderAvatar: "/avatars/1.jpg",
                isOwn: false,
            },
            {
                id: "2",
                text: "I'm planning to be there!",
                time: "10:32",
                senderId: "me",
                senderName: "You",
                isOwn: true,
            },
            {
                id: "3",
                text: "Great! Let's meet on Saturday at 3:00 PM",
                time: "10:35",
                senderId: "u2",
                senderName: "Maria",
                senderAvatar: "/avatars/2.jpg",
                isOwn: false,
                isAdmin: true,
            },
            {
                id: "4",
                text: "Got it 👍",
                time: "10:36",
                senderId: "me",
                senderName: "You",
                isOwn: true,
            },
        ],
    },
];

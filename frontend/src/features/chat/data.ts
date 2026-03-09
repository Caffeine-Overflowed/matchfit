import type { NewMatch, ChatMessage } from "./types";

export const MOCK_NEW_MATCHES: NewMatch[] = [
    { id: "1", name: "Anna", avatar: "/avatars/1.jpg", isNew: true },
    { id: "2", name: "Maria", avatar: "/avatars/2.jpg" },
    { id: "3", name: "Elena", avatar: "/avatars/3.jpg" },
    { id: "4", name: "Olga", avatar: "/avatars/4.jpg" },
    { id: "5", name: "Daria", avatar: "/avatars/5.jpg" },
    { id: "6", name: "Irina", avatar: "/avatars/6.jpg" },
];

export const MOCK_CHATS: ChatMessage[] = [
    {
        id: "1",
        recipientId: "u1",
        recipientName: "Anna",
        recipientAvatar: "/avatars/1.jpg",
        lastMessage: "Hi! How are you?",
        time: "19:46",
        isRead: true,
        unreadCount: 0,
    },
    {
        id: "2",
        recipientId: "u2",
        recipientName: "Maria",
        recipientAvatar: "/avatars/2.jpg",
        lastMessage: "See you tomorrow at the event",
        time: "18:30",
        isRead: false,
        unreadCount: 2,
    },
    {
        id: "3",
        recipientId: "u3",
        recipientName: "Elena",
        recipientAvatar: "/avatars/3.jpg",
        lastMessage: "Thanks for the info!",
        time: "Yesterday",
        isRead: true,
    },
    {
        id: "4",
        recipientId: "u4",
        recipientName: "Olga",
        recipientAvatar: "/avatars/4.jpg",
        lastMessage: "Great idea, let's discuss",
        time: "Yesterday",
        isRead: true,
    },
];

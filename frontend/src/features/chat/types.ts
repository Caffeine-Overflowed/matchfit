export interface NewMatch {
    id: string;
    name: string;
    avatar: string;
    isNew?: boolean;
}

export interface ChatMessage {
    id: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar: string;
    lastMessage: string;
    time: string;
    isRead: boolean;
    unreadCount?: number;
}

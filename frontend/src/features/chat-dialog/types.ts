export interface Message {
    id: string;
    text: string;
    time: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    isOwn: boolean;
    isAdmin?: boolean;
}

export interface ChatInfo {
    id: string;
    name: string;
    avatar: string;
    participantsCount: number;
    isGroup: boolean;
}

export interface MessagesGroup {
    date: string;
    messages: Message[];
}

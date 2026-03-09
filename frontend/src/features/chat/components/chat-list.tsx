"use client";

import type { ChatMessage } from "../types";
import { ChatListItem } from "./chat-list-item";

interface ChatListProps {
    chats: ChatMessage[];
}

export function ChatList({ chats }: ChatListProps) {
    return (
        <div className="flex flex-col">
            <h2 className="text-[14px] sm:text-[16px] font-medium text-text-primary px-4 py-3 sm:py-4">
                Messages
            </h2>

            <div className="flex flex-col">
                {chats.map((chat) => (
                    <ChatListItem key={chat.id} chat={chat} />
                ))}
            </div>
        </div>
    );
}

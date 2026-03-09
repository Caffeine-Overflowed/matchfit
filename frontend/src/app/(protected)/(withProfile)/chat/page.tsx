"use client";

import { useQuery } from "@apollo/client/react";
import { MyRecentMatchesDocument } from "@/shared/api/graphql";
import {
    ChatHeader,
    ChatList,
    NewMatchesCarousel,
    useMyChats,
    type ChatMessage,
    type NewMatch,
} from "@/features/chat";

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
        return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    }
}

export default function ChatPage() {
    const { chats, loading: chatsLoading } = useMyChats();
    const { data: matchesData, loading: matchesLoading } = useQuery(MyRecentMatchesDocument);

    const loading = chatsLoading || matchesLoading;

    // Map API chats to UI format
    const mappedChats: ChatMessage[] = chats.map((chat) => ({
        id: chat.id,
        recipientId: chat.id,
        recipientName: chat.title ?? chat.otherUser?.email ?? "Chat",
        recipientAvatar: chat.imageFileName ?? "/avatars/default.jpg",
        lastMessage: chat.lastMessage?.content ?? "",
        time: chat.lastMessage?.sentAt ? formatTime(chat.lastMessage.sentAt) : "",
        isRead: chat.lastMessage?.isRead ?? true,
        unreadCount: chat.unreadCount > 0 ? chat.unreadCount : undefined,
    }));

    // Map recent matches to UI format
    const newMatches: NewMatch[] = (matchesData?.myRecentMatches ?? []).map((match) => ({
        id: match.chatId,
        name: match.matcherProfile.name,
        avatar: match.matcherProfile.avatarUrl,
        isNew: true,
    }));

    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4">
                <ChatHeader />
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-text-tertiary">Loading...</span>
                </div>
            ) : (
                <>
                    {newMatches.length > 0 && (
                        <div className="mt-2 sm:mt-4 px-4">
                            <NewMatchesCarousel matches={newMatches} />
                        </div>
                    )}

                    <div className="mt-4 sm:mt-6 flex-1">
                        {mappedChats.length > 0 ? (
                            <ChatList chats={mappedChats} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                                <div className="text-[48px] mb-4">💬</div>
                                <h2 className="text-[18px] font-medium text-text-primary mb-2">
                                    No chats yet
                                </h2>
                                <p className="text-[14px] text-text-tertiary">
                                    Find like-minded people and start chatting
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

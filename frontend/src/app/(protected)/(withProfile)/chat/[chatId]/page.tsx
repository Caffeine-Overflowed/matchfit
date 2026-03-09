"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useProfile } from "@/features/auth";
import {
    ChatDialogHeader,
    DateSeparator,
    MessageBubble,
    MessageInput,
    useChatInfo,
    useChatMessages,
    useSendMessage,
    useMarkAsRead,
    type Message,
    type ChatInfo,
    type MessagesGroup,
} from "@/features/chat-dialog";
import { ChatKind } from "@/shared/api/graphql";

function formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
    }
}

export default function ChatDialogPage() {
    const params = useParams();
    const chatId = params.chatId as string;

    const { profile } = useProfile();
    const currentUserId = profile?.userId;

    const { chatInfo, loading: infoLoading } = useChatInfo(chatId);
    const { messages: apiMessages, loading: messagesLoading } = useChatMessages(chatId);
    const { sendMessage, loading: sendingMessage } = useSendMessage(chatId);
    const { markAsRead } = useMarkAsRead();

    // Determine chat type
    const isChannel = chatInfo?.type === ChatKind.Channel;
    const isGroup = chatInfo?.type === ChatKind.Group || chatInfo?.type === ChatKind.Channel;

    // Mark as read on mount
    useEffect(() => {
        if (chatId) {
            markAsRead(chatId);
        }
    }, [chatId, markAsRead]);

    // Map API messages to UI format and group by date
    const messagesGroups: MessagesGroup[] = useMemo(() => {
        if (!apiMessages.length) return [];

        const groups: Map<string, Message[]> = new Map();

        // Sort messages by date (oldest first)
        const sortedMessages = [...apiMessages].sort(
            (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        for (const msg of sortedMessages) {
            const dateKey = new Date(msg.sentAt).toDateString();
            const message: Message = {
                id: msg.id,
                text: msg.content,
                time: formatMessageTime(msg.sentAt),
                senderId: msg.sender.id,
                senderName: msg.sender.email.split("@")[0],
                isOwn: msg.sender.id === currentUserId,
            };

            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey)!.push(message);
        }

        return Array.from(groups.entries()).map(([dateKey, messages]) => ({
            date: formatDateSeparator(dateKey),
            messages,
        }));
    }, [apiMessages, currentUserId]);

    // Map chat info to UI format
    const mappedChatInfo: ChatInfo | null = useMemo(() => {
        if (!chatInfo) return null;
        return {
            id: chatInfo.id,
            name: chatInfo.title ?? chatInfo.profile?.name ?? "Chat",
            avatar: chatInfo.imageFileName ?? chatInfo.profile?.avatarUrl ?? "/avatars/default.jpg",
            participantsCount: 2,
            isGroup: isGroup,
        };
    }, [chatInfo, isGroup]);

    const handleSend = async (text: string) => {
        if (sendingMessage) return;
        await sendMessage(text);
    };

    const loading = infoLoading || messagesLoading;

    if (loading && !mappedChatInfo) {
        return (
            <div className="flex flex-1 flex-col h-full items-center justify-center">
                <span className="text-text-tertiary">Loading...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            {mappedChatInfo && <ChatDialogHeader chat={mappedChatInfo} />}

            <div className="flex-1 overflow-y-auto bg-bg-secondary">
                <div className="flex flex-col gap-1 py-2">
                    {messagesGroups.length > 0 ? (
                        messagesGroups.map((group) => (
                            <div key={group.date}>
                                <DateSeparator date={group.date} />
                                <div className="flex flex-col gap-1">
                                    {group.messages.map((message, index) => {
                                        const prevMessage = group.messages[index - 1];
                                        // Show avatar only in groups, and only for first message in sequence from same sender
                                        const showAvatar =
                                            isGroup &&
                                            !message.isOwn &&
                                            (!prevMessage || prevMessage.senderId !== message.senderId);
                                        // Show sender name only in groups
                                        const showSenderName =
                                            isGroup &&
                                            !message.isOwn &&
                                            (!prevMessage || prevMessage.senderId !== message.senderId);

                                        return (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                showAvatar={showAvatar}
                                                showSenderName={showSenderName}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full px-8 py-20 text-center">
                            <div className="text-[48px] mb-4">👋</div>
                            <p className="text-[14px] text-text-tertiary">
                                Start a conversation now
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hide input for channels */}
            {!isChannel && <MessageInput onSend={handleSend} />}
        </div>
    );
}

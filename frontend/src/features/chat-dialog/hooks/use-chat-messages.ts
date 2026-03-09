"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@apollo/client/react";
import {
    ChatMessagesDocument,
    ChatInfoDocument,
    type ChatMessagesQuery,
    type ChatInfoQuery,
} from "@/shared/api/graphql";

export type ApiMessage = ChatMessagesQuery["chatMessages"]["messages"][number];
export type ApiChatInfo = ChatInfoQuery["chatInfo"];

export function useChatMessages(chatId: string, limit = 50) {
    const [cursor, setCursor] = useState<{
        id: string | null;
        sentAt: string | null;
    }>({ id: null, sentAt: null });

    const { data, loading, error, fetchMore } = useQuery(ChatMessagesDocument, {
        variables: {
            input: {
                chatId,
                limit,
                cursorId: cursor.id,
                cursorSentAt: cursor.sentAt,
            },
        },
        fetchPolicy: "cache-and-network",
        pollInterval: 3000, // Poll every 3 seconds for new messages
    });

    const messages = data?.chatMessages.messages ?? [];
    const hasMore = data?.chatMessages.hasMore ?? false;

    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;

        const nextCursorId = data?.chatMessages.nextCursorId;
        const nextCursorSentAt = data?.chatMessages.nextCursorSentAt;

        if (!nextCursorId) return;

        await fetchMore({
            variables: {
                input: {
                    chatId,
                    limit,
                    cursorId: nextCursorId,
                    cursorSentAt: nextCursorSentAt,
                },
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return {
                    chatMessages: {
                        ...fetchMoreResult.chatMessages,
                        messages: [
                            ...prev.chatMessages.messages,
                            ...fetchMoreResult.chatMessages.messages,
                        ],
                    },
                };
            },
        });

        setCursor({ id: nextCursorId, sentAt: nextCursorSentAt });
    }, [chatId, data, fetchMore, hasMore, limit, loading]);

    return {
        messages,
        loading,
        error,
        hasMore,
        loadMore,
    };
}

export function useChatInfo(chatId: string) {
    const { data, loading, error } = useQuery(ChatInfoDocument, {
        variables: { chatId },
        fetchPolicy: "cache-and-network",
    });

    return {
        chatInfo: data?.chatInfo ?? null,
        loading,
        error,
    };
}

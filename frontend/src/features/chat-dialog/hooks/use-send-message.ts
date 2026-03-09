"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import {
    SendMessageDocument,
    MarkAsReadDocument,
    ChatMessagesDocument,
} from "@/shared/api/graphql";

export function useSendMessage(chatId: string) {
    const [sendMessageMutation, { loading }] = useMutation(SendMessageDocument, {
        refetchQueries: [
            {
                query: ChatMessagesDocument,
                variables: {
                    input: {
                        chatId,
                        limit: 50,
                        cursorId: null,
                        cursorSentAt: null,
                    },
                },
            },
        ],
        update: (cache) => {
            // Invalidate nearby events so it refetches on next visit
            cache.evict({ fieldName: "nearbyEvents" });
            cache.gc();
        },
    });

    const sendMessage = useCallback(
        async (content: string) => {
            try {
                const result = await sendMessageMutation({
                    variables: {
                        input: { chatId, content },
                    },
                });
                return result.data?.sendMessage ?? null;
            } catch (err) {
                console.error("Send message error:", err);
                return null;
            }
        },
        [chatId, sendMessageMutation]
    );

    return {
        sendMessage,
        loading,
    };
}

export function useMarkAsRead() {
    const [markAsReadMutation] = useMutation(MarkAsReadDocument);

    const markAsRead = useCallback(
        async (chatId: string) => {
            try {
                const result = await markAsReadMutation({
                    variables: {
                        input: { chatId },
                    },
                });
                return result.data?.markAsRead.success ?? false;
            } catch (err) {
                console.error("Mark as read error:", err);
                return false;
            }
        },
        [markAsReadMutation]
    );

    return { markAsRead };
}

"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { DeleteChatDocument } from "@/shared/api/graphql";

export function useDeleteChat() {
    const [deleteChatMutation, { loading }] = useMutation(DeleteChatDocument, {
        update: (cache, result, { variables }) => {
            if (!result.data?.deleteChat.success) return;
            const chatId = variables?.input.chatId;
            if (!chatId) return;
            cache.evict({
                id: cache.identify({ __typename: "ChatType", id: chatId }),
            });
            cache.gc();
        },
    });

    const deleteChat = useCallback(
        async (chatId: string) => {
            try {
                const result = await deleteChatMutation({
                    variables: { input: { chatId } },
                });
                return result.data?.deleteChat.success ?? false;
            } catch (err) {
                console.error("Delete chat error:", err);
                return false;
            }
        },
        [deleteChatMutation]
    );

    return { deleteChat, loading };
}

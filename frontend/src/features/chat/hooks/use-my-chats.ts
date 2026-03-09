"use client";

import { useQuery } from "@apollo/client/react";
import { MyChatsDocument, type MyChatsQuery } from "@/shared/api/graphql";

export type Chat = MyChatsQuery["myChats"][number];

export function useMyChats(limit = 50, offset = 0) {
    const { data, loading, error, refetch } = useQuery(MyChatsDocument, {
        variables: { limit, offset },
        fetchPolicy: "cache-and-network",
        pollInterval: 5000, // Poll every 5 seconds for new messages/unread counts
    });

    const chats = data?.myChats ?? [];

    return {
        chats,
        loading,
        error,
        refetch,
    };
}

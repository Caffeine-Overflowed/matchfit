"use client";

import { useQuery } from "@apollo/client/react";
import { MyChatsDocument, type MyChatsQuery } from "@/shared/api/graphql";

export type Chat = MyChatsQuery["myChats"][number];

export function useMyChats(limit = 50, offset = 0) {
    const { data, loading, error, refetch } = useQuery(MyChatsDocument, {
        variables: { limit, offset },
        fetchPolicy: "cache-and-network",
        pollInterval: 5000, // Poll every 5 seconds for new messages/unread counts
        // Apollo v4 defaults this to true — every poll would flip `loading`
        // and flash the "Loading..." state over the chat list.
        notifyOnNetworkStatusChange: false,
    });

    const chats = data?.myChats ?? [];

    return {
        chats,
        loading,
        error,
        refetch,
    };
}

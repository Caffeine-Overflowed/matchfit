"use client";

import { useQuery } from "@apollo/client/react";
import {
    MyEventsDocument,
    type MyEventsQuery,
    type EventStatus,
} from "@/shared/api/graphql";

export type ApiEvent = MyEventsQuery["myEvents"]["items"][number];

interface UseMyEventsOptions {
    limit?: number;
    offset?: number;
    statuses?: EventStatus[];
}

export function useMyEvents(options: UseMyEventsOptions = {}) {
    const { limit = 10, offset = 0, statuses } = options;

    const { data, loading, error, refetch } = useQuery(MyEventsDocument, {
        variables: {
            params: {
                limit,
                offset,
                statuses,
            },
        },
        fetchPolicy: "cache-and-network",
    });

    const events = data?.myEvents.items ?? [];
    const totalCount = data?.myEvents.totalCount ?? 0;
    const hasMore = data?.myEvents.hasMore ?? false;

    return {
        events,
        totalCount,
        hasMore,
        loading,
        error,
        refetch,
    };
}

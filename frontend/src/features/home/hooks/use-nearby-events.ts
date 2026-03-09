"use client";

import { useQuery } from "@apollo/client/react";
import { NearbyEventsDocument } from "@/shared/api/graphql";

interface UseNearbyEventsOptions {
    limit?: number;
}

export function useNearbyEvents({ limit = 10 }: UseNearbyEventsOptions = {}) {
    const { data, loading, error, refetch } = useQuery(NearbyEventsDocument, {
        variables: { limit },
    });

    const nearbyEvents = data?.nearbyEvents ?? [];

    return {
        nearbyEvents,
        isLoading: loading,
        error,
        refetch,
    };
}

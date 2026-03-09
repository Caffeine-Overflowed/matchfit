"use client";

import { useQuery } from "@apollo/client/react";
import {EventDocument, EventType} from "@/shared/api/graphql";

export function useEvent(eventId: string) {
    const { data, loading, error, refetch } = useQuery(EventDocument, {
        variables: { eventId },
        skip: !eventId,
    });

    return {
        event: data?.event as EventType | null,
        isLoading: loading,
        error,
        refetch,
    };
}

"use client";

import { useMutation } from "@apollo/client/react";
import { UpdateEventDocument, UpdateEventInput, EventFragment } from "@/shared/api/graphql";

export function useUpdateEvent() {
    const [updateEventMutation, { loading, error }] = useMutation(UpdateEventDocument, {
        update: (cache) => {
            // Invalidate event lists so they refetch
            cache.evict({ fieldName: "event" });
            cache.evict({ fieldName: "myEvents" });
            cache.evict({ fieldName: "nearbyEvents" });
            cache.gc();
        },
    });

    const updateEvent = async (eventData: UpdateEventInput): Promise<EventFragment | null> => {
        const result = await updateEventMutation({
            variables: { eventData },
        });

        return result.data?.updateEvent ?? null;
    };

    return {
        updateEvent,
        isLoading: loading,
        error,
    };
}

"use client";

import { useMutation } from "@apollo/client/react";
import { CreateEventDocument, CreateEventInput, EventFragment } from "@/shared/api/graphql";

export function useCreateEvent() {
    const [createEventMutation, { loading, error }] = useMutation(CreateEventDocument, {
        update: (cache) => {
            // Invalidate event lists so they refetch
            cache.evict({ fieldName: "myEvents" });
            cache.evict({ fieldName: "nearbyEvents" });
            cache.gc();
        },
    });

    const createEvent = async (eventData: CreateEventInput): Promise<EventFragment | null> => {
        const result = await createEventMutation({
            variables: { eventData },
        });

        return result.data?.createEvent ?? null;
    };

    return {
        createEvent,
        isLoading: loading,
        error,
    };
}

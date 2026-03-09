"use client";

import { useQuery } from "@apollo/client/react";
import { SportsDocument, type SportType } from "@/shared/api/graphql";

export function useSports() {
    const { data, loading, error } = useQuery(SportsDocument);

    const sports: SportType[] = data?.sports ?? [];

    return {
        sports,
        isLoading: loading,
        error,
    };
}

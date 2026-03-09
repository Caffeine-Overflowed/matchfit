"use client";

import { useQuery } from "@apollo/client/react";
import { GoalsDocument, type GoalType } from "@/shared/api/graphql";

export function useGoals() {
    const { data, loading, error } = useQuery(GoalsDocument);

    const goals: GoalType[] = data?.goals ?? [];

    return {
        goals,
        isLoading: loading,
        error,
    };
}

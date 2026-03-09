"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import {
    SimilarProfilesDocument,
    SwipeDocument,
    type ProfileFilterInput,
    type SimilarProfilesQuery,
} from "@/shared/api/graphql";
import type { PeopleFilters } from "@/features/filters";

type SimilarProfile = SimilarProfilesQuery["similarProfiles"][number];

function convertFiltersToInput(filters: PeopleFilters): ProfileFilterInput {
    return {
        distanceKm: filters.distanceKm,
        gender: filters.gender === "all" ? null : filters.gender,
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        goalIds: filters.goalIds.length > 0 ? filters.goalIds : null,
        sportIds: filters.sportIds.length > 0 ? filters.sportIds : null,
        languages: filters.languages.length > 0 ? filters.languages : null,
        chronotype: filters.chronotypes.length > 0 ? filters.chronotypes : null,
        heightMin: filters.heightMin,
        heightMax: filters.heightMax,
        weightMin: filters.weightMin,
        weightMax: filters.weightMax,
    };
}

export function useSimilarProfiles(filters: PeopleFilters) {
    const { data, loading, error, refetch } = useQuery(SimilarProfilesDocument, {
        variables: {
            filters: convertFiltersToInput(filters),
            limit: 20,
            offset: 0,
        },
        fetchPolicy: "cache-and-network",
    });

    const [swipeMutation] = useMutation(SwipeDocument);

    const profiles = data?.similarProfiles ?? [];

    const swipe = async (targetId: string, isLiked: boolean) => {
        try {
            const result = await swipeMutation({
                variables: { targetId, isLiked },
            });
            return result.data?.swipe ?? false;
        } catch (err) {
            console.error("Swipe error:", err);
            return false;
        }
    };

    return {
        profiles,
        loading,
        error,
        refetch,
        swipe,
    };
}

export type { SimilarProfile };

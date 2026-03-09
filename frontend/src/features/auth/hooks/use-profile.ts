"use client";

import { useQuery } from "@apollo/client/react";
import { MyProfileDocument, type ProfileFragmentFragment } from "@/shared/api/graphql";
import { useUserStore } from "@/shared/store/user-store";

export function useProfile() {
    const { isAuthorized } = useUserStore();

    const { data, loading, error, refetch } = useQuery(MyProfileDocument, {
        skip: !isAuthorized,
    });

    const profile: ProfileFragmentFragment | null = data?.myProfile ?? null;
    const hasProfile = profile !== null;

    return {
        profile,
        hasProfile,
        isLoading: loading,
        error,
        refetch,
    };
}

"use client";

import { useMutation } from "@apollo/client/react";
import { CreateProfileDocument, MyProfileDocument } from "@/shared/api/graphql";
import type { OnboardingData } from "../types";

export function useCreateProfile() {
    const [createProfileMutation, { loading, error }] = useMutation(CreateProfileDocument);

    const createProfile = async (data: OnboardingData) => {
        if (!data.profile.avatar) {
            throw new Error("Avatar is required");
        }
        if (!data.profile.birthYear || !data.profile.birthMonth) {
            throw new Error("Birth date is required");
        }
        if (!data.profile.gender) {
            throw new Error("Gender is required");
        }
        if (!data.profile.chronotype) {
            throw new Error("Chronotype is required");
        }

        const result = await createProfileMutation({
            variables: {
                data: {
                    name: data.profile.name,
                    birthYear: data.profile.birthYear,
                    birthMonth: data.profile.birthMonth,
                    gender: data.profile.gender,
                    chronotype: data.profile.chronotype,
                    avatar: data.profile.avatar,
                    languages: data.languageIds,
                    bio: data.profile.bio,
                    goalIds: data.goalIds,
                    sportIds: data.sportIds,
                    lat: data.location?.lat ?? 0,
                    lon: data.location?.lon ?? 0,
                    height: data.profile.height,
                    weight: data.profile.weight,
                },
            },
            update: (cache, { data: mutationData }) => {
                if (mutationData?.createProfile) {
                    cache.writeQuery({
                        query: MyProfileDocument,
                        data: { myProfile: mutationData.createProfile },
                    });
                }
            },
        });

        return result.data?.createProfile;
    };

    return {
        createProfile,
        isLoading: loading,
        error,
    };
}

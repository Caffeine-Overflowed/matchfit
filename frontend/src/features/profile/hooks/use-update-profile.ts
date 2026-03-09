"use client";

import { useMutation } from "@apollo/client/react";
import { UpdateProfileDocument, MyProfileDocument, Chronotype } from "@/shared/api/graphql";

export interface UpdateProfileData {
    name: string;
    avatar: File;
    bio?: string;
    birthYear: number;
    birthMonth: number;
    gender: string;
    chronotype: Chronotype;
    goalIds: number[];
    sportIds: number[];
    height?: number;
    weight?: number;
    languages?: string[];
    lat?: number;
    lon?: number;
}

export function useUpdateProfile() {
    const [updateProfileMutation, { loading, error }] = useMutation(UpdateProfileDocument);

    const updateProfile = async (data: UpdateProfileData) => {
        const result = await updateProfileMutation({
            variables: {
                data: {
                    name: data.name,
                    avatar: data.avatar,
                    bio: data.bio,
                    birthYear: data.birthYear,
                    birthMonth: data.birthMonth,
                    gender: data.gender,
                    chronotype: data.chronotype,
                    goalIds: data.goalIds,
                    sportIds: data.sportIds,
                    height: data.height,
                    weight: data.weight,
                    languages: data.languages,
                    lat: data.lat,
                    lon: data.lon,
                },
            },
            update: (cache, { data: mutationData }) => {
                if (mutationData?.updateProfile) {
                    cache.writeQuery({
                        query: MyProfileDocument,
                        data: { myProfile: mutationData.updateProfile },
                    });
                }
            },
            refetchQueries: [MyProfileDocument],
        });

        return result.data?.updateProfile;
    };

    return {
        updateProfile,
        isLoading: loading,
        error,
    };
}

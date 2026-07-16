"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client/react";
import { SwipeDocument } from "@/shared/api/graphql";
import type { SimilarProfile } from "./use-similar-profiles";

export function useSwipeProfiles(profiles: SimilarProfile[]) {
    const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

    const [swipeMutation] = useMutation(SwipeDocument, {
        update: (cache) => {
            // Invalidate matches list so it refetches on next visit
            cache.evict({ fieldName: "myRecentMatches" });
            cache.gc();
        },
    });

    // Filter out already swiped profiles
    const availableProfiles = useMemo(() => {
        return profiles.filter(p => !swipedIds.has(p.userId));
    }, [profiles, swipedIds]);

    // Always show the first not-yet-swiped profile: swiping already removes
    // the card via the filter above, so advancing an index too would skip
    // every other profile and end the deck halfway through.
    const currentProfile = availableProfiles[0] ?? null;
    const hasMoreProfiles = availableProfiles.length > 0;

    const handleSwipe = useCallback(async (isLiked: boolean) => {
        if (!currentProfile) return;

        const targetId = currentProfile.userId;
        setSwipedIds(prev => new Set(prev).add(targetId));

        // Send to API in background
        try {
            await swipeMutation({
                variables: { targetId, isLiked },
            });
        } catch (err) {
            console.error("Swipe error:", err);
        }
    }, [currentProfile, swipeMutation]);

    const handleLike = useCallback(() => handleSwipe(true), [handleSwipe]);
    const handleDislike = useCallback(() => handleSwipe(false), [handleSwipe]);

    const reset = useCallback(() => {
        setSwipedIds(new Set());
    }, []);

    return {
        currentProfile,
        hasMoreProfiles,
        handleLike,
        handleDislike,
        reset,
    };
}

// Legacy hook for backwards compatibility with mock data
import type { UserProfile } from "../types";

export function useSwipe(users: UserProfile[]) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [liked, setLiked] = useState<string[]>([]);
    const [disliked, setDisliked] = useState<string[]>([]);

    const currentUser = users[currentIndex] ?? null;
    const hasMoreUsers = currentIndex < users.length;

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    const handleLike = useCallback(() => {
        if (currentUser) {
            setLiked((prev) => [...prev, currentUser.id]);
            goToNext();
        }
    }, [currentUser, goToNext]);

    const handleDislike = useCallback(() => {
        if (currentUser) {
            setDisliked((prev) => [...prev, currentUser.id]);
            goToNext();
        }
    }, [currentUser, goToNext]);

    const reset = useCallback(() => {
        setCurrentIndex(0);
        setLiked([]);
        setDisliked([]);
    }, []);

    return {
        currentUser,
        currentIndex,
        hasMoreUsers,
        liked,
        disliked,
        handleLike,
        handleDislike,
        reset,
    };
}

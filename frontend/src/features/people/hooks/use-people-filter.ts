"use client";

import { useState, useMemo } from "react";
import type { UserProfile } from "../types";

const INTEREST_KEYWORDS: Record<string, string[]> = {
    football: ["⚽", "Football"],
    basketball: ["🏀", "Basketball"],
    tennis: ["🎾", "Tennis"],
    running: ["🏃", "Running"],
    yoga: ["🧘", "Yoga"],
    gym: ["🏋️", "Gym"],
};

function hasInterest(user: UserProfile, interestId: string): boolean {
    const keywords = INTEREST_KEYWORDS[interestId] || [];
    return user.interests.some((i) => keywords.some((k) => i.includes(k)));
}

export function usePeopleFilter(users: UserProfile[]) {
    const [selectedInterest, setSelectedInterest] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesInterest = selectedInterest === "all" || hasInterest(user, selectedInterest);
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesInterest && matchesSearch;
        });
    }, [users, selectedInterest, searchQuery]);

    return {
        filteredUsers,
        selectedInterest,
        setSelectedInterest,
        searchQuery,
        setSearchQuery,
    };
}

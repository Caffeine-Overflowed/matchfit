import type { DifficultyLevel } from "@/shared/api/graphql";

export interface ProfileInfo {
    name: string;
    avatarUrl: string;
    locationName?: string;
}

export interface EventItem {
    id: string;
    title: string;
    imageUrl?: string;
    startTime: string;
    participantsCount: number;
    maxParticipants: number;
    difficulty: DifficultyLevel;
}

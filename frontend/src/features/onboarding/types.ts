// Re-export API types
export type { SportType, GoalType, ProfileInput } from "@/shared/api/graphql";
import { Chronotype } from "@/shared/api/graphql";
export { Chronotype };

// Hardcoded goal for UI (until backend has goals data)
export interface HardcodedGoal {
    id: string;
    title: string;
    description: string;
    icon: string;
}

// Hardcoded language for UI (until backend has languages data)
export interface HardcodedLanguage {
    id: string;
    name: string;
    flag: string;
}

export type Gender = "male" | "female" | "other";

export interface ProfileData {
    name: string;
    birthYear: number | null;
    birthMonth: number | null;
    gender: Gender | null;
    chronotype: Chronotype | null;
    height: number | null;
    weight: number | null;
    avatar: File | null;
    avatarPreview: string | null;
    bio: string;
}

export interface OnboardingData {
    goalIds: number[];
    sportIds: number[];
    languageIds: string[];
    profile: ProfileData;
    location: { lat: number; lon: number } | null;
}

export type OnboardingStep = "goals" | "sports" | "languages" | "profile" | "location";

export interface StepInfo {
    title: string;
    subtitle?: string;
}

import type { InterestFilter, UserProfile } from "./types";

export const INTEREST_FILTERS: InterestFilter[] = [
    { id: "all", label: "All", icon: "" },
    { id: "football", label: "Football", icon: "⚽" },
    { id: "basketball", label: "Basketball", icon: "🏀" },
    { id: "tennis", label: "Tennis", icon: "🎾" },
    { id: "running", label: "Running", icon: "🏃" },
    { id: "yoga", label: "Yoga", icon: "🧘" },
    { id: "gym", label: "Gym", icon: "🏋️" },
];

export const MOCK_USERS: UserProfile[] = [];

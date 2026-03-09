import type { HardcodedGoal, HardcodedLanguage, OnboardingStep, StepInfo } from "./types";

// Hardcoded languages until backend has data
export const LANGUAGES: HardcodedLanguage[] = [
    { id: "ru", name: "Russian", flag: "🇷🇺" },
    { id: "en", name: "English", flag: "🇬🇧" },
    { id: "es", name: "Español", flag: "🇪🇸" },
    { id: "de", name: "Deutsch", flag: "🇩🇪" },
    { id: "fr", name: "Français", flag: "🇫🇷" },
    { id: "it", name: "Italiano", flag: "🇮🇹" },
    { id: "pt", name: "Português", flag: "🇵🇹" },
    { id: "zh", name: "中文", flag: "🇨🇳" },
    { id: "ja", name: "日本語", flag: "🇯🇵" },
    { id: "ko", name: "한국어", flag: "🇰🇷" },
    { id: "ar", name: "العربية", flag: "🇸🇦" },
    { id: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { id: "tr", name: "Türkçe", flag: "🇹🇷" },
    { id: "pl", name: "Polski", flag: "🇵🇱" },
    { id: "uk", name: "Ukrainian", flag: "🇺🇦" },
    { id: "sr", name: "Serbian", flag: "🇷🇸" },
];

// Hardcoded goals until backend has data
export const GOALS: HardcodedGoal[] = [
    {
        id: "find-partner",
        title: "Find a partner",
        description: "For joint workouts and sports activities",
        icon: "users",
    },
    {
        id: "find-events",
        title: "Find events",
        description: "Sports events and activities nearby",
        icon: "calendar",
    },
    {
        id: "meet-people",
        title: "Meet people",
        description: "With people who share similar interests",
        icon: "heart",
    },
    {
        id: "improve-skills",
        title: "Improve skills",
        description: "Find a coach or more experienced partner",
        icon: "trending-up",
    },
    {
        id: "stay-active",
        title: "Stay active",
        description: "Maintain motivation and consistency",
        icon: "zap",
    },
];

export const STEP_INFO: Record<OnboardingStep, StepInfo> = {
    goals: {
        title: "Tell us why you're here",
    },
    sports: {
        title: "Select your interests",
        subtitle: "Select at least one to continue",
    },
    languages: {
        title: "What languages do you speak?",
        subtitle: "Select 1 to 5 languages",
    },
    profile: {
        title: "",
    },
    location: {
        title: "Where are you located?",
        subtitle: "You can skip this step",
    },
};

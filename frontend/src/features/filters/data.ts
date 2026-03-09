import { EventCategory, DifficultyLevel, Chronotype } from "@/shared/api/graphql";
import type { EventFilters, PeopleFilters, FilterBadgeOption, DateFilterOption, GenderFilter } from "./types";

export const DEFAULT_FILTERS: EventFilters = {
    radiusKm: 10,
    categories: [],
    difficulties: [],
    sportIds: [],
    dateFilter: "all",
    dateFrom: null,
    dateTo: null,
    participantsMin: null,
    participantsMax: null,
    organizedByFriends: false,
};

export const DEFAULT_PEOPLE_FILTERS: PeopleFilters = {
    distanceKm: 50,
    gender: "all",
    ageMin: 18,
    ageMax: 60,
    goalIds: [],
    sportIds: [],
    languages: [],
    chronotypes: [],
    heightMin: null,
    heightMax: null,
    weightMin: null,
    weightMax: null,
};

export const DIFFICULTY_OPTIONS: FilterBadgeOption<DifficultyLevel>[] = [
    { id: DifficultyLevel.Easy, label: "Easy", icon: "easy" },
    { id: DifficultyLevel.Medium, label: "Medium", icon: "medium" },
    { id: DifficultyLevel.Hard, label: "Hard", icon: "hard" },
];

export const CATEGORY_OPTIONS: FilterBadgeOption<EventCategory>[] = [
    { id: EventCategory.Lecture, label: "Lecture" },
    { id: EventCategory.Workshop, label: "Workshop" },
    { id: EventCategory.Sport, label: "Sports" },
    { id: EventCategory.Trip, label: "Tour" },
];

export const DATE_FILTER_OPTIONS: FilterBadgeOption<DateFilterOption>[] = [
    { id: "all", label: "All dates" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "this_week", label: "This week" },
    { id: "this_month", label: "This month" },
    { id: "custom", label: "Select date", icon: "calendar" },
];

export const DISTANCE_MAX = 100;
export const PARTICIPANTS_MAX = 50;

// People filters
export const PEOPLE_DISTANCE_MAX = 200;
export const AGE_MIN = 18;
export const AGE_MAX = 80;
export const HEIGHT_MIN = 140;
export const HEIGHT_MAX = 220;
export const WEIGHT_MIN = 40;
export const WEIGHT_MAX = 150;

export const GENDER_OPTIONS: FilterBadgeOption<GenderFilter>[] = [
    { id: "all", label: "All" },
    { id: "male", label: "Men" },
    { id: "female", label: "Women" },
];

export const CHRONOTYPE_OPTIONS: FilterBadgeOption<Chronotype>[] = [
    { id: Chronotype.EarlyBird, label: "🌅 Early Bird" },
    { id: Chronotype.Pigeon, label: "🕊️ Pigeon" },
    { id: Chronotype.NightOwl, label: "🦉 Night Owl" },
];

export const LANGUAGE_OPTIONS = [
    { id: "ru", label: "🇷🇺 Russian" },
    { id: "en", label: "🇬🇧 English" },
    { id: "es", label: "🇪🇸 Spanish" },
    { id: "de", label: "🇩🇪 German" },
    { id: "fr", label: "🇫🇷 French" },
    { id: "it", label: "🇮🇹 Italian" },
    { id: "pt", label: "🇵🇹 Portuguese" },
    { id: "zh", label: "🇨🇳 Chinese" },
    { id: "ja", label: "🇯🇵 Japanese" },
    { id: "ko", label: "🇰🇷 Korean" },
    { id: "tr", label: "🇹🇷 Turkish" },
    { id: "pl", label: "🇵🇱 Polish" },
    { id: "uk", label: "🇺🇦 Ukrainian" },
];

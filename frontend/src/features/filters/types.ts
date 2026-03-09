import type { EventCategory, DifficultyLevel, Chronotype } from "@/shared/api/graphql";

export type DateFilterOption = "all" | "today" | "tomorrow" | "this_week" | "this_month" | "custom";

export interface EventFilters {
    radiusKm: number;
    categories: EventCategory[];
    difficulties: DifficultyLevel[];
    sportIds: number[];
    dateFilter: DateFilterOption;
    dateFrom: Date | null;
    dateTo: Date | null;
    participantsMin: number | null;
    participantsMax: number | null;
    organizedByFriends: boolean;
}

export type GenderFilter = "all" | "male" | "female";

export interface PeopleFilters {
    distanceKm: number;
    gender: GenderFilter;
    ageMin: number;
    ageMax: number;
    goalIds: number[];
    sportIds: number[];
    languages: string[];
    chronotypes: Chronotype[];
    heightMin: number | null;
    heightMax: number | null;
    weightMin: number | null;
    weightMax: number | null;
}

export interface FilterBadgeOption<T = string> {
    id: T;
    label: string;
    icon?: string;
}

import { EventCategory as EventCategoryEnum } from "@/shared/api/graphql";

export interface CategoryTab {
    id: string;
    label: string;
    category: EventCategoryEnum | null; // null means "all"
}

export interface NearbyEvent {
    id: string;
    title: string;
    image: string | null;
}

export interface UpcomingEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    spotsAvailable: number;
    spotsTotal: number;
    image: string | null;
}

export interface WeekDay {
    date: number;
    dayName: string;
    fullDate: Date;
    isToday: boolean;
}

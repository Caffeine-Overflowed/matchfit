import { EventCategory } from "@/shared/api/graphql";
import type { CategoryTab, NearbyEvent, UpcomingEvent } from "./types";

export const EVENT_CATEGORIES: CategoryTab[] = [
    { id: "all", label: "All", category: null },
    { id: "lectures", label: "Lectures", category: EventCategory.Lecture },
    { id: "workshops", label: "Workshops", category: EventCategory.Workshop },
    { id: "sports", label: "Sports", category: EventCategory.Sport },
    { id: "tours", label: "Tours", category: EventCategory.Trip },
];

export const MOCK_NEARBY_EVENTS: NearbyEvent[] = [
    {
        id: "1",
        title: "Interface Design Workshop",
        image: null,
    },
    {
        id: "2",
        title: "Contemporary Art Lecture",
        image: null,
    },
    {
        id: "3",
        title: "Yoga in the Park",
        image: null,
    },
];

export const MOCK_UPCOMING_EVENTS: UpcomingEvent[] = [
    {
        id: "1",
        title: "Yoga in the Park for Beginners",
        date: "20.01.2026",
        time: "15:30",
        spotsAvailable: 5,
        spotsTotal: 10,
        image: null,
    },
    {
        id: "2",
        title: "Ceramics Masterclass",
        date: "21.01.2026",
        time: "18:00",
        spotsAvailable: 3,
        spotsTotal: 8,
        image: null,
    },
    {
        id: "3",
        title: "Running Club: Morning Run",
        date: "22.01.2026",
        time: "07:00",
        spotsAvailable: 12,
        spotsTotal: 20,
        image: null,
    },
    {
        id: "1",
        title: "Yoga in the Park for Beginners",
        date: "20.01.2026",
        time: "15:30",
        spotsAvailable: 5,
        spotsTotal: 10,
        image: null,
    },
    {
        id: "2",
        title: "Ceramics Masterclass",
        date: "21.01.2026",
        time: "18:00",
        spotsAvailable: 3,
        spotsTotal: 8,
        image: null,
    },
    {
        id: "3",
        title: "Running Club: Morning Run",
        date: "22.01.2026",
        time: "07:00",
        spotsAvailable: 12,
        spotsTotal: 20,
        image: null,
    },
];

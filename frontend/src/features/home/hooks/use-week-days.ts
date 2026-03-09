"use client";

import { useMemo } from "react";
import type { WeekDay } from "../types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function useWeekDays(startDate: Date = new Date()): WeekDay[] {
    return useMemo(() => {
        const days: WeekDay[] = [];
        const today = new Date(startDate);
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                date: date.getDate(),
                dayName: DAY_NAMES[date.getDay()],
                fullDate: date,
                isToday: i === 0,
            });
        }
        return days;
    }, [startDate]);
}

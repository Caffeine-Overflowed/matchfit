"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { EventsDocument, type GetEventsInput } from "@/shared/api/graphql";
import type { EventFilters, DateFilterOption } from "@/features/filters";

interface UseEventsOptions {
    filters: EventFilters;
    search?: string;
    selectedDate?: Date;
    limit?: number;
    offset?: number;
}

function getDateRangeFromFilter(dateFilter: DateFilterOption): { fromDate?: Date; toDate?: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
        case "today":
            return {
                fromDate: today,
                toDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
            };
        case "tomorrow": {
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return {
                fromDate: tomorrow,
                toDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 - 1),
            };
        }
        case "this_week": {
            const dayOfWeek = today.getDay();
            const daysUntilEndOfWeek = 7 - dayOfWeek;
            return {
                fromDate: today,
                toDate: new Date(today.getTime() + daysUntilEndOfWeek * 24 * 60 * 60 * 1000 - 1),
            };
        }
        case "this_month": {
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            return {
                fromDate: today,
                toDate: endOfMonth,
            };
        }
        case "all":
        case "custom":
        default:
            return {};
    }
}

export function useEvents({ filters, search = "", selectedDate, limit = 20, offset = 0 }: UseEventsOptions) {
    const dateRange = useMemo(() => {
        // If a specific day is selected from WeekDayPicker, use it
        if (selectedDate) {
            const dayStart = new Date(selectedDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(selectedDate);
            dayEnd.setHours(23, 59, 59, 999);
            return { fromDate: dayStart, toDate: dayEnd };
        }
        // Otherwise use the filter's date settings
        if (filters.dateFilter === "custom" && (filters.dateFrom || filters.dateTo)) {
            return {
                fromDate: filters.dateFrom ?? undefined,
                toDate: filters.dateTo ?? undefined,
            };
        }
        return getDateRangeFromFilter(filters.dateFilter);
    }, [selectedDate, filters.dateFilter, filters.dateFrom, filters.dateTo]);

    const params: GetEventsInput = {
        radiusKm: filters.radiusKm,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        difficulties: filters.difficulties.length > 0 ? filters.difficulties : undefined,
        sportIds: filters.sportIds.length > 0 ? filters.sportIds : undefined,
        fromDate: dateRange.fromDate?.toISOString(),
        toDate: dateRange.toDate?.toISOString(),
        search: search || undefined,
        limit,
        offset,
    };

    const { data, loading, error, refetch, fetchMore } = useQuery(EventsDocument, {
        variables: { params },
    });

    const events = data?.events.items ?? [];
    const totalCount = data?.events.totalCount ?? 0;
    const hasMore = data?.events.hasMore ?? false;

    const loadMore = () => {
        if (hasMore) {
            fetchMore({
                variables: {
                    params: { ...params, offset: events.length },
                },
            });
        }
    };

    return {
        events,
        totalCount,
        hasMore,
        isLoading: loading,
        error,
        refetch,
        loadMore,
    };
}

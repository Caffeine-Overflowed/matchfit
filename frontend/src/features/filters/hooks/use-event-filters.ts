"use client";

import { useState, useCallback, useMemo } from "react";
import type { EventCategory, DifficultyLevel } from "@/shared/api/graphql";
import type { EventFilters, DateFilterOption } from "../types";
import { DEFAULT_FILTERS } from "../data";

export function useEventFilters() {
    const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<EventFilters>(DEFAULT_FILTERS);

    const updateFilter = useCallback(<K extends keyof EventFilters>(
        key: K,
        value: EventFilters[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const toggleCategory = useCallback((category: EventCategory) => {
        setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter((c) => c !== category)
                : [...prev.categories, category],
        }));
    }, []);

    const toggleDifficulty = useCallback((difficulty: DifficultyLevel) => {
        setFilters((prev) => ({
            ...prev,
            difficulties: prev.difficulties.includes(difficulty)
                ? prev.difficulties.filter((d) => d !== difficulty)
                : [...prev.difficulties, difficulty],
        }));
    }, []);

    const toggleSport = useCallback((sportId: number) => {
        setFilters((prev) => ({
            ...prev,
            sportIds: prev.sportIds.includes(sportId)
                ? prev.sportIds.filter((id) => id !== sportId)
                : [...prev.sportIds, sportId],
        }));
    }, []);

    const setDateFilter = useCallback((dateFilter: DateFilterOption) => {
        setFilters((prev) => ({ ...prev, dateFilter }));
    }, []);

    const toggleOrganizedByFriends = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            organizedByFriends: !prev.organizedByFriends,
        }));
    }, []);

    // Set category from tab (immediate apply for quick filtering)
    const setCategoryFromTab = useCallback((category: EventCategory | null) => {
        const newCategories = category ? [category] : [];
        setFilters((prev) => ({ ...prev, categories: newCategories }));
        setAppliedFilters((prev) => ({ ...prev, categories: newCategories }));
    }, []);

    const reset = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    const apply = useCallback(() => {
        setAppliedFilters(filters);
    }, [filters]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
    }, [filters, appliedFilters]);

    const hasActiveFilters = useMemo(() => {
        return (
            filters.categories.length > 0 ||
            filters.difficulties.length > 0 ||
            filters.sportIds.length > 0 ||
            filters.dateFilter !== "all" ||
            filters.dateFrom !== null ||
            filters.dateTo !== null ||
            filters.participantsMin !== null ||
            filters.participantsMax !== null ||
            filters.organizedByFriends
        );
    }, [filters]);

    return {
        filters,
        appliedFilters,
        updateFilter,
        toggleCategory,
        toggleDifficulty,
        toggleSport,
        setDateFilter,
        toggleOrganizedByFriends,
        setCategoryFromTab,
        reset,
        apply,
        hasChanges,
        hasActiveFilters,
    };
}

"use client";

import { useState, useCallback, useMemo } from "react";
import type { PeopleFilters, GenderFilter } from "../types";
import type { Chronotype } from "@/shared/api/graphql";
import { DEFAULT_PEOPLE_FILTERS } from "../data";

export function usePeopleFilters() {
    const [filters, setFilters] = useState<PeopleFilters>(DEFAULT_PEOPLE_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<PeopleFilters>(DEFAULT_PEOPLE_FILTERS);

    const updateFilter = useCallback(<K extends keyof PeopleFilters>(
        key: K,
        value: PeopleFilters[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setGender = useCallback((gender: GenderFilter) => {
        setFilters((prev) => ({ ...prev, gender }));
    }, []);

    const setAgeRange = useCallback((min: number, max: number) => {
        setFilters((prev) => ({ ...prev, ageMin: min, ageMax: max }));
    }, []);

    const setDistanceKm = useCallback((distance: number) => {
        setFilters((prev) => ({ ...prev, distanceKm: distance }));
    }, []);

    const toggleGoal = useCallback((goalId: number) => {
        setFilters((prev) => ({
            ...prev,
            goalIds: prev.goalIds.includes(goalId)
                ? prev.goalIds.filter((id) => id !== goalId)
                : [...prev.goalIds, goalId],
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

    const toggleLanguage = useCallback((languageId: string) => {
        setFilters((prev) => ({
            ...prev,
            languages: prev.languages.includes(languageId)
                ? prev.languages.filter((id) => id !== languageId)
                : [...prev.languages, languageId],
        }));
    }, []);

    const toggleChronotype = useCallback((chronotype: Chronotype) => {
        setFilters((prev) => ({
            ...prev,
            chronotypes: prev.chronotypes.includes(chronotype)
                ? prev.chronotypes.filter((c) => c !== chronotype)
                : [...prev.chronotypes, chronotype],
        }));
    }, []);

    const setHeightRange = useCallback((min: number | null, max: number | null) => {
        setFilters((prev) => ({ ...prev, heightMin: min, heightMax: max }));
    }, []);

    const setWeightRange = useCallback((min: number | null, max: number | null) => {
        setFilters((prev) => ({ ...prev, weightMin: min, weightMax: max }));
    }, []);

    const reset = useCallback(() => {
        setFilters(DEFAULT_PEOPLE_FILTERS);
    }, []);

    const apply = useCallback(() => {
        setAppliedFilters(filters);
    }, [filters]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
    }, [filters, appliedFilters]);

    const hasActiveFilters = useMemo(() => {
        return (
            filters.gender !== "all" ||
            filters.ageMin !== DEFAULT_PEOPLE_FILTERS.ageMin ||
            filters.ageMax !== DEFAULT_PEOPLE_FILTERS.ageMax ||
            filters.distanceKm !== DEFAULT_PEOPLE_FILTERS.distanceKm ||
            filters.goalIds.length > 0 ||
            filters.sportIds.length > 0 ||
            filters.languages.length > 0 ||
            filters.chronotypes.length > 0 ||
            filters.heightMin !== null ||
            filters.heightMax !== null ||
            filters.weightMin !== null ||
            filters.weightMax !== null
        );
    }, [filters]);

    return {
        filters,
        appliedFilters,
        updateFilter,
        setGender,
        setAgeRange,
        setDistanceKm,
        toggleGoal,
        toggleSport,
        toggleLanguage,
        toggleChronotype,
        setHeightRange,
        setWeightRange,
        reset,
        apply,
        hasChanges,
        hasActiveFilters,
    };
}

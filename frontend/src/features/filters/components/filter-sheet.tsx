"use client";

import { useState, useEffect, useCallback } from "react";
import { HiCalendar } from "react-icons/hi2";
import { cx } from "@/shared/utils/cx";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Switch } from "@/shared/components/ui/switch";
import type { SportType, DifficultyLevel } from "@/shared/api/graphql";
import type { EventFilters, DateFilterOption } from "../types";
import {
    DIFFICULTY_OPTIONS,
    CATEGORY_OPTIONS,
    DATE_FILTER_OPTIONS,
    DISTANCE_MAX,
    PARTICIPANTS_MAX,
} from "../data";
import { FilterSection } from "./filter-section";
import { DatePickerSheet } from "./date-picker-sheet";

interface FilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    filters: EventFilters;
    sports: SportType[];
    locationName?: string;
    onUpdateFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
    onToggleCategory: (category: EventFilters["categories"][number]) => void;
    onToggleDifficulty: (difficulty: EventFilters["difficulties"][number]) => void;
    onToggleSport: (sportId: number) => void;
    onSetDateFilter: (dateFilter: DateFilterOption) => void;
    onToggleOrganizedByFriends: () => void;
    onReset: () => void;
    onApply: () => void;
}

const DIFFICULTY_ICONS: Record<DifficultyLevel, string> = {
    EASY: "/icons/difficulty-easy.svg",
    MEDIUM: "/icons/difficulty-medium.svg",
    HARD: "/icons/difficulty-hard.svg",
    N_A: "",
};

export function FilterSheet({
    isOpen,
    onClose,
    filters,
    sports,
    locationName,
    onUpdateFilter,
    onToggleCategory,
    onToggleDifficulty,
    onToggleSport,
    onSetDateFilter,
    onToggleOrganizedByFriends,
    onReset,
    onApply,
}: FilterSheetProps) {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const handleApply = () => {
        onApply();
        onClose();
    };

    const handleDateFilterClick = (option: DateFilterOption) => {
        if (option === "custom") {
            setIsDatePickerOpen(true);
        } else {
            onSetDateFilter(option);
            // Clear custom dates when selecting predefined option
            onUpdateFilter("dateFrom", null);
            onUpdateFilter("dateTo", null);
        }
    };

    const handleDatePickerApply = (from: Date | null, to: Date | null) => {
        onSetDateFilter("custom");
        onUpdateFilter("dateFrom", from);
        onUpdateFilter("dateTo", to);
    };

    return (
        <div
            className={cx(
                "fixed inset-0 z-[55] transition-all duration-300",
                isOpen ? "visible" : "invisible"
            )}
        >
            {/* Backdrop */}
            <div
                className={cx(
                    "absolute inset-0 bg-black/50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleBackdropClick}
            />

            {/* Sheet */}
            <div
                className={cx(
                    "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-bg-secondary rounded-t-3xl transition-transform duration-300 max-h-[80vh] overflow-hidden flex flex-col",
                    isOpen ? "" : "translate-y-full"
                )}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-12 h-1.5 bg-white rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4 shrink-0">
                    <h2 className="text-display-xs font-medium text-text-primary">Filters</h2>
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-sm font-medium text-text-brand-tertiary"
                    >
                        Reset
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 pb-4">
                    {/* Location */}
                    {locationName && (
                        <div className="mb-4">
                            <span className="text-sm text-text-primary">Location </span>
                            <span className="text-sm text-text-primary">{locationName}</span>
                        </div>
                    )}

                    {/* Distance */}
                    <FilterSection title="Distance">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">km</span>
                            <span className="text-sm text-text-secondary">{filters.radiusKm} km</span>
                        </div>
                        <Slider
                            value={[filters.radiusKm]}
                            onChange={(value) => {
                                const v = Array.isArray(value) ? value[0] : value;
                                onUpdateFilter("radiusKm", v);
                            }}
                            minValue={1}
                            maxValue={DISTANCE_MAX}
                            step={1}
                        />
                    </FilterSection>

                    {/* Difficulty */}
                    <FilterSection title="Difficulty">
                        <div className="flex flex-wrap gap-2">
                            {DIFFICULTY_OPTIONS.map((option) => {
                                const isSelected = filters.difficulties.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onToggleDifficulty(option.id)}
                                        className={cn(
                                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                            isSelected
                                                ? "bg-white border-border-brand text-text-primary"
                                                : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                        )}
                                    >
                                        {DIFFICULTY_ICONS[option.id] && (
                                            <img
                                                src={DIFFICULTY_ICONS[option.id]}
                                                alt=""
                                                width={16}
                                                height={16}
                                                className="size-4"
                                            />
                                        )}
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {/* Event Type */}
                    <FilterSection title="Event Type">
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map((option) => {
                                const isSelected = filters.categories.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onToggleCategory(option.id)}
                                        className={cn(
                                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                            isSelected
                                                ? "bg-white border-border-brand text-text-primary"
                                                : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                        )}
                                    >
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {/* Organized by Friends */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-sm text-text-primary">Organized by friends</span>
                        <Switch
                            isSelected={filters.organizedByFriends}
                            onChange={onToggleOrganizedByFriends}
                        />
                    </div>

                    {/* Sports */}
                    <FilterSection title="Sports">
                        <div className="flex flex-wrap gap-2">
                            {sports.map((sport) => {
                                const isSelected = filters.sportIds.includes(sport.id);
                                return (
                                    <button
                                        key={sport.id}
                                        type="button"
                                        onClick={() => onToggleSport(sport.id)}
                                        className={cn(
                                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                            isSelected
                                                ? "bg-white border-border-brand text-text-primary"
                                                : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                        )}
                                    >
                                        {sport.iconUrl && (
                                            <img
                                                src={sport.iconUrl}
                                                alt=""
                                                width={16}
                                                height={16}
                                                className="size-4"
                                            />
                                        )}
                                        <span>{sport.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {/* Date Filter */}
                    <FilterSection title="When">
                        <div className="flex flex-wrap gap-2">
                            {DATE_FILTER_OPTIONS.map((option) => {
                                const isSelected = filters.dateFilter === option.id;
                                const isCustom = option.id === "custom";
                                const hasCustomDates = filters.dateFrom || filters.dateTo;

                                // Show custom dates in label when selected
                                let label = option.label;
                                if (isCustom && isSelected && hasCustomDates) {
                                    const fromStr = filters.dateFrom?.toLocaleDateString("en-US", { day: "numeric", month: "short" });
                                    const toStr = filters.dateTo?.toLocaleDateString("en-US", { day: "numeric", month: "short" });
                                    if (fromStr && toStr) {
                                        label = `${fromStr} - ${toStr}`;
                                    } else if (fromStr) {
                                        label = `from ${fromStr}`;
                                    }
                                }

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleDateFilterClick(option.id)}
                                        className={cn(
                                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                            isSelected
                                                ? "bg-white border-border-brand text-text-primary"
                                                : isCustom
                                                    ? "bg-bg-brand-secondary border-transparent text-text-primary"
                                                    : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                        )}
                                    >
                                        <span>{label}</span>
                                        {isCustom && (
                                            <HiCalendar className="size-4" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {/* Participants */}
                    <FilterSection title="Number of participants">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">from/to</span>
                            <span className="text-sm text-text-secondary">
                                {filters.participantsMin === null && filters.participantsMax === null
                                    ? "Any"
                                    : `${filters.participantsMin ?? 1} – ${filters.participantsMax ?? PARTICIPANTS_MAX}`}
                            </span>
                        </div>
                        <Slider
                            value={[
                                filters.participantsMin ?? 1,
                                filters.participantsMax ?? PARTICIPANTS_MAX,
                            ]}
                            onChange={(value) => {
                                const values = Array.isArray(value) ? value : [value, value];
                                onUpdateFilter("participantsMin", values[0]);
                                onUpdateFilter("participantsMax", values[1]);
                            }}
                            minValue={1}
                            maxValue={PARTICIPANTS_MAX}
                            step={1}
                        />
                    </FilterSection>
                </div>

                {/* Apply Button */}
                <div className="px-5 py-4 shrink-0">
                    <Button
                        onClick={handleApply}
                        className="h-12 w-full rounded-xl bg-bg-brand-solid text-white text-base font-medium hover:bg-brand-700"
                    >
                        Apply
                    </Button>
                </div>
            </div>

            {/* Date Picker Sheet */}
            <DatePickerSheet
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                selectedFrom={filters.dateFrom}
                selectedTo={filters.dateTo}
                onApply={handleDatePickerApply}
            />
        </div>
    );
}

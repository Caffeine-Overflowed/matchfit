"use client";

import { useEffect, useCallback } from "react";
import { cx } from "@/shared/utils/cx";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import type { SportType, GoalType, Chronotype } from "@/shared/api/graphql";
import type { PeopleFilters, GenderFilter } from "../types";
import {
    GENDER_OPTIONS,
    CHRONOTYPE_OPTIONS,
    LANGUAGE_OPTIONS,
    PEOPLE_DISTANCE_MAX,
    AGE_MIN,
    AGE_MAX,
    HEIGHT_MIN,
    HEIGHT_MAX,
    WEIGHT_MIN,
    WEIGHT_MAX,
} from "../data";
import { FilterSection } from "./filter-section";

interface PeopleFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    filters: PeopleFilters;
    sports: SportType[];
    goals: GoalType[];
    locationName?: string;
    onSetGender: (gender: GenderFilter) => void;
    onSetAgeRange: (min: number, max: number) => void;
    onSetDistanceKm: (distance: number) => void;
    onToggleGoal: (goalId: number) => void;
    onToggleSport: (sportId: number) => void;
    onToggleLanguage: (languageId: string) => void;
    onToggleChronotype: (chronotype: Chronotype) => void;
    onSetHeightRange: (min: number | null, max: number | null) => void;
    onSetWeightRange: (min: number | null, max: number | null) => void;
    onReset: () => void;
    onApply: () => void;
}

export function PeopleFilterSheet({
    isOpen,
    onClose,
    filters,
    sports,
    goals,
    locationName,
    onSetGender,
    onSetAgeRange,
    onSetDistanceKm,
    onToggleGoal,
    onToggleSport,
    onToggleLanguage,
    onToggleChronotype,
    onSetHeightRange,
    onSetWeightRange,
    onReset,
    onApply,
}: PeopleFilterSheetProps) {
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
                            <span className="text-sm text-text-secondary">{filters.distanceKm} km</span>
                        </div>
                        <Slider
                            value={[filters.distanceKm]}
                            onChange={(value) => {
                                const v = Array.isArray(value) ? value[0] : value;
                                onSetDistanceKm(v);
                            }}
                            minValue={1}
                            maxValue={PEOPLE_DISTANCE_MAX}
                            step={1}
                        />
                    </FilterSection>

                    {/* Gender */}
                    <FilterSection title="Gender">
                        <div className="flex flex-wrap gap-2">
                            {GENDER_OPTIONS.map((option) => {
                                const isSelected = filters.gender === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onSetGender(option.id)}
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

                    {/* Age */}
                    <FilterSection title="Age">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">from/to</span>
                            <span className="text-sm text-text-secondary">
                                {filters.ageMin} – {filters.ageMax} years
                            </span>
                        </div>
                        <Slider
                            value={[filters.ageMin, filters.ageMax]}
                            onChange={(value) => {
                                const values = Array.isArray(value) ? value : [value, value];
                                onSetAgeRange(values[0], values[1]);
                            }}
                            minValue={AGE_MIN}
                            maxValue={AGE_MAX}
                            step={1}
                        />
                    </FilterSection>

                    {/* Goals */}
                    {goals.length > 0 && (
                        <FilterSection title="Goals">
                            <div className="flex flex-wrap gap-2">
                                {goals.map((goal) => {
                                    const isSelected = filters.goalIds.includes(goal.id);
                                    return (
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => onToggleGoal(goal.id)}
                                            className={cn(
                                                "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                                isSelected
                                                    ? "bg-white border-border-brand text-text-primary"
                                                    : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                            )}
                                        >
                                            {goal.iconUrl && (
                                                <img
                                                    src={goal.iconUrl}
                                                    alt=""
                                                    width={16}
                                                    height={16}
                                                    className="size-4"
                                                />
                                            )}
                                            <span>{goal.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    {/* Sports */}
                    {sports.length > 0 && (
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
                    )}

                    {/* Languages */}
                    <FilterSection title="Languages">
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => {
                                const isSelected = filters.languages.includes(lang.id);
                                return (
                                    <button
                                        key={lang.id}
                                        type="button"
                                        onClick={() => onToggleLanguage(lang.id)}
                                        className={cn(
                                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                            isSelected
                                                ? "bg-white border-border-brand text-text-primary"
                                                : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                        )}
                                    >
                                        <span>{lang.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {/* Chronotype */}
                    <FilterSection title="Chronotype">
                        <div className="flex flex-wrap gap-2">
                            {CHRONOTYPE_OPTIONS.map((chrono) => {
                                const isSelected = filters.chronotypes.includes(chrono.id);
                                return (
                                    <button
                                        key={chrono.id}
                                        type="button"
                                        onClick={() => onToggleChronotype(chrono.id)}
                                        className={cn(
                                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                                            isSelected
                                                ? "bg-white border-border-brand text-text-primary"
                                                : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                                        )}
                                    >
                                        <span>{chrono.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {/* Height */}
                    <FilterSection title="Height">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">cm</span>
                            <span className="text-sm text-text-secondary">
                                {filters.heightMin === null && filters.heightMax === null
                                    ? "Any"
                                    : `${filters.heightMin ?? HEIGHT_MIN} – ${filters.heightMax ?? HEIGHT_MAX}`}
                            </span>
                        </div>
                        <Slider
                            value={[
                                filters.heightMin ?? HEIGHT_MIN,
                                filters.heightMax ?? HEIGHT_MAX,
                            ]}
                            onChange={(value) => {
                                const values = Array.isArray(value) ? value : [value, value];
                                const min = values[0] === HEIGHT_MIN ? null : values[0];
                                const max = values[1] === HEIGHT_MAX ? null : values[1];
                                onSetHeightRange(min, max);
                            }}
                            minValue={HEIGHT_MIN}
                            maxValue={HEIGHT_MAX}
                            step={1}
                        />
                    </FilterSection>

                    {/* Weight */}
                    <FilterSection title="Weight">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">kg</span>
                            <span className="text-sm text-text-secondary">
                                {filters.weightMin === null && filters.weightMax === null
                                    ? "Any"
                                    : `${filters.weightMin ?? WEIGHT_MIN} – ${filters.weightMax ?? WEIGHT_MAX}`}
                            </span>
                        </div>
                        <Slider
                            value={[
                                filters.weightMin ?? WEIGHT_MIN,
                                filters.weightMax ?? WEIGHT_MAX,
                            ]}
                            onChange={(value) => {
                                const values = Array.isArray(value) ? value : [value, value];
                                const min = values[0] === WEIGHT_MIN ? null : values[0];
                                const max = values[1] === WEIGHT_MAX ? null : values[1];
                                onSetWeightRange(min, max);
                            }}
                            minValue={WEIGHT_MIN}
                            maxValue={WEIGHT_MAX}
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
        </div>
    );
}

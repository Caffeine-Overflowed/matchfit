"use client";

import { cn } from "@/lib/utils";
import type { SportType } from "../types";

interface SportsStepProps {
    sports: SportType[];
    selectedSportIds: number[];
    onToggleSport: (sportId: number) => void;
    isLoading?: boolean;
}

export function SportsStep({
    sports,
    selectedSportIds,
    onToggleSport,
    isLoading,
}: SportsStepProps) {
    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-8 w-24 rounded-full bg-gray-100 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {sports.map((sport) => {
                const isSelected = selectedSportIds.includes(sport.id);

                return (
                    <button
                        key={sport.id}
                        type="button"
                        onClick={() => onToggleSport(sport.id)}
                        className={cn(
                            "flex h-8 items-center gap-2.5 rounded-[100px] px-3 text-[14px] transition-all border",
                            isSelected
                                ? "bg-white border-brand-600 text-black"
                                : "bg-white border-border-secondary text-text-tertiary hover:border-brand-300"
                        )}
                    >
                        {sport.iconUrl && (
                            <img
                                src={sport.iconUrl}
                                alt=""
                                width={16}
                                height={16}
                                className="h-4 w-4"
                            />
                        )}
                        <span>{sport.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

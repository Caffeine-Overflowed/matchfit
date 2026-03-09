"use client";

import { cn } from "@/lib/utils";
import type { FilterBadgeOption } from "../types";

interface FilterBadgesProps<T> {
    options: FilterBadgeOption<T>[];
    selected: T[];
    onToggle: (id: T) => void;
}

export function FilterBadges<T>({
    options,
    selected,
    onToggle,
}: FilterBadgesProps<T>) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const isSelected = selected.includes(option.id);

                return (
                    <button
                        key={String(option.id)}
                        type="button"
                        onClick={() => onToggle(option.id)}
                        className={cn(
                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all border",
                            isSelected
                                ? "bg-white border-border-brand text-text-primary"
                                : "bg-bg-tertiary border-transparent text-text-primary hover:border-brand-300"
                        )}
                    >
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

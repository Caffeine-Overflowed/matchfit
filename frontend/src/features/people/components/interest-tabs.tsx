"use client";

import { cx } from "@/shared/utils/cx";
import type { InterestFilter } from "../types";

interface InterestTabsProps {
    interests: InterestFilter[];
    selected: string;
    onSelect: (id: string) => void;
}

export function InterestTabs({ interests, selected, onSelect }: InterestTabsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {interests.map((interest) => (
                <button
                    key={interest.id}
                    onClick={() => onSelect(interest.id)}
                    className={cx(
                        "shrink-0 px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-1.5",
                        selected === interest.id
                            ? "bg-bg-brand-solid text-white"
                            : "bg-bg-tertiary text-text-primary hover:bg-gray-200"
                    )}
                >
                    {interest.icon && <span>{interest.icon}</span>}
                    <span>{interest.label}</span>
                </button>
            ))}
        </div>
    );
}

"use client";

import { cx } from "@/shared/utils/cx";
import type { WeekDay } from "../types";

interface WeekDayPickerProps {
    days: WeekDay[];
    selectedIndex: number | null;
    onSelect: (index: number | null) => void;
}

export function WeekDayPicker({ days, selectedIndex, onSelect }: WeekDayPickerProps) {
    const handleSelect = (index: number) => {
        // Toggle off if already selected
        if (selectedIndex === index) {
            onSelect(null);
        } else {
            onSelect(index);
        }
    };

    return (
        <div className="px-4 md:px-0 py-4">
            <div className="flex items-center gap-1">
                {days.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={cx(
                            "flex-1 flex flex-col items-center gap-2 py-3 sm:py-4 rounded-xl transition-colors",
                            selectedIndex === index
                                ? "bg-bg-tertiary"
                                : "bg-transparent hover:bg-gray-100"
                        )}
                    >
                        <span className="text-subtitle font-medium text-text-primary">{day.date}</span>
                        <span className="text-small text-text-secondary">{day.dayName}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

"use client";

import { HiMagnifyingGlass, HiAdjustmentsHorizontal } from "react-icons/hi2";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFilterClick?: () => void;
}

export function SearchBar({ value, onChange, placeholder = "Search", onFilterClick }: SearchBarProps) {
    return (
        <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 bg-bg-tertiary border border-border-secondary rounded-full px-4 py-3">
                <HiMagnifyingGlass className="h-5 w-5 text-text-quaternary shrink-0" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-placeholder outline-none min-w-0"
                />
            </div>
            {onFilterClick && (
                <button
                    onClick={onFilterClick}
                    className="flex items-center justify-center bg-bg-tertiary border border-border-secondary rounded-full p-3 shrink-0"
                >
                    <HiAdjustmentsHorizontal className="h-5 w-5 text-text-quaternary" />
                </button>
            )}
        </div>
    );
}

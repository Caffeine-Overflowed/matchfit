"use client";

import { cx } from "@/shared/utils/cx";
import type { CategoryTab } from "../types";

interface CategoryTabsProps {
    categories: CategoryTab[];
    selected: string;
    onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelect(category.id)}
                    className={cx(
                        "shrink-0 px-4 py-2 rounded-full text-sm transition-colors",
                        selected === category.id
                            ? "bg-bg-accent text-text-primary"
                            : "bg-bg-tertiary text-text-primary hover:bg-gray-200"
                    )}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
}

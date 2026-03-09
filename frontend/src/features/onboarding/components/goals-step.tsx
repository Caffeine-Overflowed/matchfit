"use client";

import {cn} from "@/lib/utils";
import type {GoalType} from "../types";


interface GoalsStepProps {
    goals: GoalType[];
    selectedGoals: number[];
    onToggleGoal: (goalId: number) => void;
    isLoading?: boolean;
}

export function GoalsStep({goals, selectedGoals, onToggleGoal, isLoading}: GoalsStepProps) {
    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2">
                {Array.from({length: 12}).map((_, i) => (
                    <div
                        key={i}
                        className="h-8 w-24 rounded-full bg-gray-100 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 sm:gap-4">
            {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);

                return (
                    <button
                        key={goal.id}
                        type="button"
                        onClick={() => onToggleGoal(goal.id)}
                        className={cn(
                            "flex items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 text-left transition-all",
                            "border-2",
                            isSelected
                                ? "border-brand-600 bg-brand-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                    >
                        <div
                            className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                isSelected ? "bg-brand-600" : "bg-gray-100"
                            )}
                        >
                            {goal.iconUrl && (
                                <div
                                    className={cn(
                                        "h-4 w-4",
                                        isSelected ? "bg-white" : "bg-gray-600"
                                    )}
                                    style={{
                                        WebkitMaskImage: `url(${goal.iconUrl})`,
                                        maskImage: `url(${goal.iconUrl})`,
                                        WebkitMaskRepeat: "no-repeat",
                                        maskRepeat: "no-repeat",
                                        WebkitMaskPosition: "center",
                                        maskPosition: "center",
                                        WebkitMaskSize: "contain",
                                        maskSize: "contain",
                                    }}
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-medium text-text-primary">{goal.name}</p>
                            <p className="text-[14px] text-text-tertiary line-clamp-2">{goal.description}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

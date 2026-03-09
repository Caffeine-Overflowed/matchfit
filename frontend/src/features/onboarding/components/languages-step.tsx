"use client";

import { cn } from "@/lib/utils";
import type { HardcodedLanguage } from "../types";

interface LanguagesStepProps {
    languages: HardcodedLanguage[];
    selectedLanguageIds: string[];
    onToggleLanguage: (languageId: string) => void;
}

export function LanguagesStep({
    languages,
    selectedLanguageIds,
    onToggleLanguage,
}: LanguagesStepProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {languages.map((language) => {
                const isSelected = selectedLanguageIds.includes(language.id);

                return (
                    <button
                        key={language.id}
                        type="button"
                        onClick={() => onToggleLanguage(language.id)}
                        className={cn(
                            "flex h-8 items-center gap-2 rounded-[100px] px-3 text-[14px] transition-all border",
                            isSelected
                                ? "bg-white border-brand-600 text-black"
                                : "bg-white border-border-secondary text-text-tertiary hover:border-brand-300"
                        )}
                    >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

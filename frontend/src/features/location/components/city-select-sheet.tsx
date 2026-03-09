"use client";

import { useEffect, useCallback } from "react";
import { HiMapPin, HiMagnifyingGlass } from "react-icons/hi2";
import { cx } from "@/shared/utils/cx";
import { useLocationSuggestion } from "@/features/location";
import { useCitySearch } from "@/features/location";
import type { LocationSuggestion } from "../types";

interface CitySelectSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: LocationSuggestion) => void;
    currentLocationName?: string | null;
}

export function CitySelectSheet({ isOpen, onClose, onSelect, currentLocationName }: CitySelectSheetProps) {
    const { suggestion, isLoading: isSuggestionLoading } = useLocationSuggestion();
    const showSuggestion = !currentLocationName && suggestion;
    const { query, setQuery, predictions, isLoading: isSearchLoading, selectPlace, clear } = useCitySearch();

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

    const handlePredictionClick = async (placeId: string) => {
        const location = await selectPlace(placeId);
        if (location) {
            clear();
            onSelect(location);
            onClose();
        }
    };

    const handleUseSuggestion = () => {
        if (suggestion) {
            clear();
            onSelect(suggestion);
            onClose();
        }
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
                    "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-bg-secondary rounded-t-3xl transition-transform duration-300 h-[60vh] flex flex-col",
                    isOpen ? "" : "translate-y-full"
                )}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 pb-3 shrink-0">
                    <h2 className="text-lg font-medium text-text-primary">Your city</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5">
                    {/* Search - at the top */}
                    <div className="relative mb-4">
                        <div className="flex items-center gap-3 bg-bg-tertiary border border-border-secondary rounded-xl px-4 py-3">
                            <HiMagnifyingGlass className="h-5 w-5 text-text-quaternary shrink-0" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search city..."
                                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-placeholder outline-none min-w-0"
                            />
                            {isSearchLoading && (
                                <div className="size-4 border-2 border-text-quaternary border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>

                        {/* Predictions Dropdown */}
                        {predictions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-secondary rounded-xl shadow-lg overflow-hidden z-10 max-h-[200px] overflow-y-auto">
                                {predictions.map((prediction) => (
                                    <button
                                        key={prediction.placeId}
                                        type="button"
                                        onClick={() => handlePredictionClick(prediction.placeId)}
                                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-bg-tertiary transition-colors text-left border-b border-border-secondary last:border-b-0"
                                    >
                                        <HiMapPin className="size-4 text-text-quaternary shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-primary truncate">
                                                {prediction.mainText}
                                            </p>
                                            <p className="text-xs text-text-secondary truncate">
                                                {prediction.secondaryText}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Current location */}
                    {currentLocationName && (
                        <div className="flex items-center gap-3 p-3 bg-white border border-border-brand rounded-xl mb-3">
                            <div className="size-8 rounded-full bg-bg-brand-solid/10 flex items-center justify-center shrink-0">
                                <HiMapPin className="size-4 text-fg-brand-primary" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm text-text-primary truncate">
                                    {currentLocationName}
                                </p>
                                <p className="text-xs text-text-tertiary">Current city</p>
                            </div>
                        </div>
                    )}

                    {/* IP Suggestion - only if there is no current city */}
                    {!currentLocationName && isSuggestionLoading ? (
                        <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-xl">
                            <div className="size-8 rounded-full bg-bg-secondary animate-pulse" />
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                            </div>
                        </div>
                    ) : showSuggestion ? (
                        <button
                            type="button"
                            onClick={handleUseSuggestion}
                            className="flex items-center gap-3 w-full p-3 rounded-xl transition-all border bg-bg-tertiary border-transparent hover:border-border-secondary"
                        >
                            <div className="size-8 rounded-full bg-bg-brand-solid/10 flex items-center justify-center shrink-0">
                                <HiMapPin className="size-4 text-fg-brand-primary" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm text-text-primary truncate">
                                    {suggestion?.name}
                                </p>
                                <p className="text-xs text-text-tertiary">Detected automatically</p>
                            </div>
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

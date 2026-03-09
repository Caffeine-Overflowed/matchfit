"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useGoogleMaps } from "@/shared/providers/google-maps-provider";
import type { LocationSuggestion, PlacePrediction } from "../types";

interface UseCitySearchResult {
    query: string;
    setQuery: (query: string) => void;
    predictions: PlacePrediction[];
    isLoading: boolean;
    selectPlace: (placeId: string) => Promise<LocationSuggestion | null>;
    clear: () => void;
}

const DEBOUNCE_MS = 300;

export function useCitySearch(): UseCitySearchResult {
    const { isLoaded } = useGoogleMaps();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Initialize services when Google Maps is loaded
    useEffect(() => {
        if (isLoaded && typeof google !== "undefined" && google.maps?.places) {
            autocompleteService.current = new google.maps.places.AutocompleteService();
            const div = document.createElement("div");
            placesService.current = new google.maps.places.PlacesService(div);
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
        }
    }, [isLoaded]);

    // Debounce query
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setDebouncedQuery(query);
        }, DEBOUNCE_MS);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
            setPredictions([]);
            return;
        }

        if (!autocompleteService.current) return;

        setIsLoading(true);

        autocompleteService.current.getPlacePredictions(
            {
                input: debouncedQuery,
                types: ["(cities)"],
                sessionToken: sessionToken.current!,
            },
            (results, status) => {
                setIsLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(
                        results.map((r) => ({
                            placeId: r.place_id,
                            description: r.description,
                            mainText: r.structured_formatting.main_text,
                            secondaryText: r.structured_formatting.secondary_text,
                        }))
                    );
                } else {
                    setPredictions([]);
                }
            }
        );
    }, [debouncedQuery]);

    const selectPlace = useCallback(async (placeId: string): Promise<LocationSuggestion | null> => {
        if (!placesService.current) return null;

        return new Promise((resolve) => {
            placesService.current!.getDetails(
                {
                    placeId,
                    fields: ["geometry", "formatted_address", "name"],
                    sessionToken: sessionToken.current!,
                },
                (place, status) => {
                    // Reset session token after selection
                    sessionToken.current = new google.maps.places.AutocompleteSessionToken();

                    if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                        resolve({
                            name: place.formatted_address || place.name || "",
                            lat: place.geometry.location.lat(),
                            lon: place.geometry.location.lng(),
                        });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }, []);

    const clear = useCallback(() => {
        setQuery("");
        setPredictions([]);
    }, []);

    return {
        query,
        setQuery,
        predictions,
        isLoading,
        selectPlace,
        clear,
    };
}

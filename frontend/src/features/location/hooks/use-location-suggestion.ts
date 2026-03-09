"use client";

import { useState, useEffect } from "react";
import type { LocationSuggestion } from "../types";

interface UseLocationSuggestionResult {
    suggestion: LocationSuggestion | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

const CACHE_KEY = "ip_location_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Try multiple IP geolocation services as fallbacks
const IP_SERVICES = [
    {
        url: "https://ip-api.com/json/?fields=city,country,lat,lon",
        parse: (data: { city?: string; country?: string; lat?: number; lon?: number }) => ({
            name: data.city && data.country ? `${data.city}, ${data.country}` : null,
            lat: data.lat,
            lon: data.lon,
        }),
    },
    {
        url: "https://ipwho.is/",
        parse: (data: { city?: string; country?: string; latitude?: number; longitude?: number }) => ({
            name: data.city && data.country ? `${data.city}, ${data.country}` : null,
            lat: data.latitude,
            lon: data.longitude,
        }),
    },
];

function getCachedLocation(): LocationSuggestion | null {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function setCachedLocation(location: LocationSuggestion) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: location,
            timestamp: Date.now(),
        }));
    } catch {
        // Ignore storage errors
    }
}

export function useLocationSuggestion(): UseLocationSuggestionResult {
    const [suggestion, setSuggestion] = useState<LocationSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLocation = async (skipCache = false) => {
        // Check cache first
        if (!skipCache) {
            const cached = getCachedLocation();
            if (cached) {
                setSuggestion(cached);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        for (const service of IP_SERVICES) {
            try {
                const res = await fetch(service.url);
                if (!res.ok) continue;

                const data = await res.json();
                const parsed = service.parse(data);

                if (parsed.name && parsed.lat && parsed.lon) {
                    const location = {
                        name: parsed.name,
                        lat: parsed.lat,
                        lon: parsed.lon,
                    };
                    setSuggestion(location);
                    setCachedLocation(location);
                    setIsLoading(false);
                    return;
                }
            } catch {
                continue;
            }
        }

        setError("Could not determine location");
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    return {
        suggestion,
        isLoading,
        error,
        refetch: () => fetchLocation(true),
    };
}

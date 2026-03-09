"use client";

import { useState, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { HiMapPin, HiXMark } from "react-icons/hi2";
import { useGoogleMaps } from "@/shared/providers/google-maps-provider";

interface LocationStepProps {
    location: { lat: number; lon: number } | null;
    onChange: (location: { lat: number; lon: number } | null) => void;
}

const DEFAULT_CENTER = { lat: 55.7558, lng: 37.6173 };

export function LocationStep({ location, onChange }: LocationStepProps) {
    const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(
        location ? { lat: location.lat, lng: location.lon } : null
    );
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const { isLoaded, loadError } = useGoogleMaps();

    const handleMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarker(pos);
            onChange({ lat: pos.lat, lon: pos.lng });
        },
        [onChange]
    );

    const handleGetMyLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                setMarker(pos);
                onChange({ lat: pos.lat, lon: pos.lng });
                setIsGettingLocation(false);
            },
            () => setIsGettingLocation(false),
            { enableHighAccuracy: true }
        );
    }, [onChange]);

    const handleClear = useCallback(() => {
        setMarker(null);
        onChange(null);
    }, [onChange]);

    if (loadError) {
        return (
            <div className="flex h-[60vh] items-center justify-center rounded-xl bg-red-50 text-red-600">
                Error loading map. Check API key.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex h-[60vh] items-center justify-center rounded-xl bg-gray-100">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleGetMyLocation}
                    disabled={isGettingLocation}
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-border-secondary bg-white text-[14px] text-text-primary hover:border-brand-300 disabled:opacity-50"
                >
                    <HiMapPin className="h-4 w-4" />
                    {isGettingLocation ? "Locating..." : "My location"}
                </button>
                {marker && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-secondary bg-white text-text-tertiary hover:border-error-300 hover:text-error-500"
                    >
                        <HiXMark className="h-5 w-5" />
                    </button>
                )}
            </div>
            <GoogleMap
                mapContainerClassName="w-full h-[55vh] rounded-xl"
                center={marker || DEFAULT_CENTER}
                zoom={marker ? 14 : 10}
                onClick={handleMapClick}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {marker && <Marker position={marker} />}
            </GoogleMap>
        </div>
    );
}

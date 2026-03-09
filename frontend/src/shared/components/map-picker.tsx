"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { HiChevronLeft } from "react-icons/hi2";
import { useGoogleMaps } from "@/shared/providers/google-maps-provider";
import { Button } from "@/shared/components/ui/button";

interface MapPickerProps {
    initialLat?: number;
    initialLon?: number;
    onConfirm: (location: { lat: number; lon: number; address: string }) => void;
    onCancel: () => void;
}

const DEFAULT_CENTER = { lat: 44.7866, lng: 20.4489 }; // Belgrade

export function MapPicker({ initialLat, initialLon, onConfirm, onCancel }: MapPickerProps) {
    const { isLoaded, loadError } = useGoogleMaps();
    const mapRef = useRef<google.maps.Map | null>(null);

    const [center, setCenter] = useState({
        lat: initialLat || DEFAULT_CENTER.lat,
        lng: initialLon || DEFAULT_CENTER.lng,
    });
    const [address, setAddress] = useState("");
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // Get initial address when map is loaded
    useEffect(() => {
        if (isLoaded) {
            reverseGeocode(center.lat, center.lng);
        }
    }, [isLoaded]);

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        setIsLoadingAddress(true);
        try {
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });

            if (response.results[0]) {
                setAddress(response.results[0].formatted_address);
            } else {
                setAddress("");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            setAddress("");
        } finally {
            setIsLoadingAddress(false);
        }
    }, []);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        setMapReady(true);
    }, []);

    const onIdle = useCallback(() => {
        if (mapRef.current) {
            const newCenter = mapRef.current.getCenter();
            if (newCenter) {
                const lat = newCenter.lat();
                const lng = newCenter.lng();
                setCenter({ lat, lng });
                reverseGeocode(lat, lng);
            }
        }
    }, [reverseGeocode]);

    const handleConfirm = () => {
        onConfirm({
            lat: center.lat,
            lon: center.lng,
            address: address,
        });
    };

    if (loadError) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-4">
                <span className="text-red-500">Error loading map</span>
                <Button onClick={onCancel}>Close</Button>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                <span className="text-text-tertiary">Loading map...</span>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center px-4 py-4 bg-white border-b border-border-secondary shrink-0">
                <button
                    onClick={onCancel}
                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100"
                >
                    <HiChevronLeft className="w-5 h-5 text-text-primary" />
                </button>
                <span className="flex-1 text-center text-[16px] font-semibold text-text-primary">
                    Select location
                </span>
                <div className="w-9" />
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <GoogleMap
                    mapContainerClassName="absolute inset-0"
                    center={!mapReady ? center : undefined}
                    zoom={15}
                    onLoad={onMapLoad}
                    onIdle={onIdle}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_CENTER,
                        },
                    }}
                />

                {/* Fixed center pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                    <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                        <path
                            d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24c0-8.836-7.164-16-16-16zm0 22a6 6 0 110-12 6 6 0 010 12z"
                            fill="#2563EB"
                        />
                    </svg>
                </div>
            </div>

            {/* Bottom panel */}
            <div className="px-4 pt-4 pb-20 bg-white border-t border-border-secondary">
                {/* Address display */}
                <div className="mb-4 flex items-start gap-3">
                    <img src="/icons/location.svg" alt="" width={20} height={20} className="mt-0.5" />
                    <div className="flex-1 min-h-[44px]">
                        {isLoadingAddress ? (
                            <span className="text-[14px] text-text-tertiary">Loading address...</span>
                        ) : address ? (
                            <span className="text-[14px] text-text-primary">{address}</span>
                        ) : (
                            <span className="text-[14px] text-text-tertiary">Move the map to select location</span>
                        )}
                    </div>
                </div>

                {/* Confirm button */}
                <Button
                    onClick={handleConfirm}
                    disabled={isLoadingAddress}
                    className="w-full h-12 rounded-xl text-[16px]"
                >
                    Confirm location
                </Button>
            </div>
        </div>
    );
}

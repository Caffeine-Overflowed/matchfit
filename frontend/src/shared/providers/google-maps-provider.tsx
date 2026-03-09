"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES: ("places")[] = ["places"];

interface GoogleMapsContextValue {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
    isLoaded: false,
    loadError: undefined,
});

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </GoogleMapsContext.Provider>
    );
}

export function useGoogleMaps() {
    return useContext(GoogleMapsContext);
}

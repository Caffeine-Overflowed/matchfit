export interface LocationSuggestion {
    name: string;
    lat: number;
    lon: number;
}

export interface PlacePrediction {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}

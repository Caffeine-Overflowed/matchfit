"use client";

import type {NearbyEventFragment} from "@/shared/api/graphql";

interface NearbyEventsCarouselProps {
    events: NearbyEventFragment[];
    onEventClick?: (eventId: string) => void;
}

export function NearbyEventsCarousel({events, onEventClick}: NearbyEventsCarouselProps) {
    if (events.length === 0) {
        return null;
    }

    return (
        <section className="py-4">
            <div className="flex items-center justify-between px-4 md:px-0 mb-3">
                <h2 className="text-subtitle font-medium text-text-primary">Events Nearby</h2>
            </div>
            <div className="flex gap-4 px-4 md:px-0 overflow-x-auto scrollbar-hide pb-2">
                {events.map((item) => (
                    <button
                        key={item.event.id}
                        onClick={() => onEventClick?.(item.event.id)}
                        className="relative shrink-0 w-[240px] sm:w-[270px] h-[200px] sm:h-[228px] bg-bg-tertiary rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
                    >
                        {item.event.imageFileName && (
                            <img
                                src={item.event.imageFileName}
                                alt={item.event.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div
                            className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex flex-col items-start justify-end p-4">
                            <p className="text-white font-medium text-left line-clamp-2">{item.event.title}</p>
                            <p className="text-white/70 text-sm mt-1">{item.distanceKm.toFixed(1)} km</p>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { HiMagnifyingGlass, HiAdjustmentsHorizontal } from "react-icons/hi2";
import {
    HomeHeader,
    CategoryTabs,
    NearbyEventsCarousel,
    WeekDayPicker,
    EventCard,
    useWeekDays,
    useEvents,
    useNearbyEvents,
    EVENT_CATEGORIES,
} from "@/features/home";
import { FilterSheet, useFilterSheet, useEventFilters } from "@/features/filters";
import { CitySelectSheet, useCitySelectSheet, type LocationSuggestion } from "@/features/location";
import { useSports } from "@/features/onboarding";
import { useProfile } from "@/features/auth";
import { useUnreadNotificationsCount } from "@/features/notifications";
import { UpdateLocationDocument, NearbyEventsDocument } from "@/shared/api/graphql";

export default function HomePage() {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const weekDays = useWeekDays();

    const { profile } = useProfile();
    const filterSheet = useFilterSheet();
    const citySelectSheet = useCitySelectSheet();
    const {
        filters,
        appliedFilters,
        updateFilter,
        toggleCategory,
        toggleDifficulty,
        toggleSport,
        setDateFilter,
        toggleOrganizedByFriends,
        setCategoryFromTab,
        reset,
        apply,
        hasActiveFilters,
    } = useEventFilters();

    // Derive selected category tab from applied filters
    const selectedCategory = appliedFilters.categories.length === 0
        ? "all"
        : EVENT_CATEGORIES.find((c) => c.category === appliedFilters.categories[0])?.id ?? "all";
    const { sports } = useSports();
    const selectedDate = selectedDay !== null ? weekDays[selectedDay]?.fullDate : undefined;
    const { events, isLoading, hasMore, loadMore } = useEvents({
        filters: appliedFilters,
        search: searchQuery,
        selectedDate,
    });
    const { nearbyEvents } = useNearbyEvents({ limit: 5 });
    const { count: unreadNotificationsCount } = useUnreadNotificationsCount();

    const [updateLocation] = useMutation(UpdateLocationDocument);

    // Hide header on scroll
    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;

        const handleScroll = () => {
            setHeaderVisible(scrollEl.scrollTop < 10);
        };

        scrollEl.addEventListener("scroll", handleScroll, { passive: true });
        return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, []);

    // Open city select sheet if location not set
    useEffect(() => {
        if (profile && !profile.locationName) {
            citySelectSheet.open();
        }
    }, [profile]);

    const handleLocationSelect = async (location: LocationSuggestion) => {
        try {
            await updateLocation({
                variables: {
                    data: {
                        lat: location.lat,
                        lon: location.lon,
                    },
                },
                update: (cache, { data }) => {
                    if (data?.updateLocation) {
                        cache.modify({
                            fields: {
                                myProfile: () => data.updateLocation,
                            },
                        });
                    }
                },
                refetchQueries: [
                    { query: NearbyEventsDocument, variables: { limit: 5 } },
                    "events",
                    "similarProfiles",
                ],
            });
        } catch (error) {
            console.error("Failed to update location:", error);
        }
    };

    const userName = profile?.name || "User";
    const userLocation = profile?.locationName || "Select city";

    return (
        <div className="fixed inset-0 bottom-20 flex flex-col bg-bg-primary">
            {/* Header - collapses on scroll */}
            <div
                className={`overflow-hidden transition-all duration-200 ${
                    headerVisible ? "max-h-20" : "max-h-0"
                }`}
            >
                <div className="max-w-md mx-auto">
                    <HomeHeader
                        userName={userName}
                        userLocation={userLocation}
                        unreadNotificationsCount={unreadNotificationsCount}
                        onNotificationsClick={() => router.push("/notifications")}
                        onLocationClick={citySelectSheet.open}
                    />
                </div>
            </div>

            {/* Sticky zone */}
            <div className="shrink-0 bg-bg-primary z-20 max-w-md mx-auto w-full">
                {/* Search */}
                <div className="px-4 md:px-0 py-3">
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-bg-tertiary border border-border-secondary rounded-full px-4 py-3 opacity-80">
                            <HiMagnifyingGlass className="h-5 w-5 text-text-quaternary shrink-0" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-placeholder outline-none min-w-0"
                            />
                        </div>
                        <button
                            onClick={filterSheet.open}
                            className="relative flex items-center justify-center bg-bg-tertiary border border-border-secondary rounded-full p-3 opacity-80 shrink-0"
                        >
                            <HiAdjustmentsHorizontal className="h-5 w-5 text-text-quaternary" />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 size-3 bg-bg-brand-solid rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="px-4 md:px-0 py-2">
                    <CategoryTabs
                        categories={EVENT_CATEGORIES}
                        selected={selectedCategory}
                        onSelect={(id) => {
                            const tab = EVENT_CATEGORIES.find((c) => c.id === id);
                            setCategoryFromTab(tab?.category ?? null);
                        }}
                    />
                </div>
            </div>

            {/* Scroll container */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto snap-y snap-mandatory">
                <div className="max-w-md mx-auto">
                    {/* Snap point 1: Carousel + Date Picker */}
                    <div className="snap-start snap-always">
                        <NearbyEventsCarousel
                            events={nearbyEvents}
                            onEventClick={(id) => router.push(`/events/${id}`)}
                        />

                        <WeekDayPicker
                            days={weekDays}
                            selectedIndex={selectedDay}
                            onSelect={setSelectedDay}
                        />
                    </div>

                    {/* Snap point 2: Events */}
                    <section className="snap-start snap-always px-4 md:px-0 pb-4 min-h-[50vh]">
                        <div className="flex flex-col gap-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-8 text-text-secondary">
                                    No events
                                </div>
                            ) : (
                                <>
                                    {events.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onClick={() => router.push(`/events/${event.id}`)}
                                        />
                                    ))}
                                    {hasMore && (
                                        <button
                                            onClick={loadMore}
                                            className="w-full py-3 text-center text-sm text-text-brand-tertiary hover:underline"
                                        >
                                            Load more
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Filter Sheet */}
            <FilterSheet
                isOpen={filterSheet.isOpen}
                onClose={filterSheet.close}
                filters={filters}
                sports={sports}
                locationName={profile?.locationName ?? undefined}
                onUpdateFilter={updateFilter}
                onToggleCategory={toggleCategory}
                onToggleDifficulty={toggleDifficulty}
                onToggleSport={toggleSport}
                onSetDateFilter={setDateFilter}
                onToggleOrganizedByFriends={toggleOrganizedByFriends}
                onReset={reset}
                onApply={apply}
            />

            {/* City Select Sheet */}
            <CitySelectSheet
                isOpen={citySelectSheet.isOpen}
                onClose={citySelectSheet.close}
                onSelect={handleLocationSelect}
                currentLocationName={profile?.locationName}
            />
        </div>
    );
}

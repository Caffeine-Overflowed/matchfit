"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@apollo/client/react";
import { GoalsDocument, SportsDocument } from "@/shared/api/graphql";
import {
    SwipeCard,
    UserProfileSheet,
    useSwipeProfiles,
    useUserProfileSheet,
    useSimilarProfiles,
} from "@/features/people";
import {
    PeopleFilterSheet,
    usePeopleFilters,
    useFilterSheet,
} from "@/features/filters";

export default function PeoplePage() {
    const router = useRouter();

    // Filters
    const filterSheet = useFilterSheet();
    const {
        filters,
        appliedFilters,
        setGender,
        setAgeRange,
        setDistanceKm,
        toggleGoal,
        toggleSport,
        toggleLanguage,
        toggleChronotype,
        setHeightRange,
        setWeightRange,
        reset: resetFilters,
        apply: applyFilters,
    } = usePeopleFilters();

    // Load goals and sports for filter sheet
    const { data: goalsData } = useQuery(GoalsDocument);
    const { data: sportsData } = useQuery(SportsDocument);

    // API data
    const { profiles, loading, error } = useSimilarProfiles(appliedFilters);

    // Swipe handling
    const {
        currentProfile,
        hasMoreProfiles,
        handleLike,
        handleDislike,
    } = useSwipeProfiles(profiles);

    const { selectedUser, isOpen, open, close } = useUserProfileSheet();

    const handleMessage = (userId: string) => {
        console.log("Message user:", userId);
        close();
    };

    const handleCardClick = () => {
        if (currentProfile) {
            // Convert SimilarProfile to UserProfile for the sheet
            open({
                id: currentProfile.userId,
                name: currentProfile.name,
                age: currentProfile.age,
                location: currentProfile.locationName ?? "",
                distance: currentProfile.distance != null ? `${currentProfile.distance} km` : undefined,
                avatar: currentProfile.avatarUrl,
                bio: currentProfile.bio ?? undefined,
                interests: currentProfile.goals?.map((g) => g.name) ?? [],
                sports: currentProfile.sports?.map((s) => s.name) ?? [],
            });
        }
    };

    const handleBack = () => {
        toast("Feature not supported yet", {
            description: "Return to previous profile will be available soon",
        });
    };

    const handleSuperLike = () => {
        toast("Feature not supported yet", {
            description: "Super like will be available soon",
        });
    };

    // Convert SimilarProfile to SwipeCard user prop
    const currentUser = currentProfile
        ? {
              id: currentProfile.userId,
              name: currentProfile.name,
              age: currentProfile.age,
              location: currentProfile.locationName ?? "",
              distance: currentProfile.distance != null ? `${currentProfile.distance} km` : undefined,
              avatar: currentProfile.avatarUrl,
              bio: currentProfile.bio ?? undefined,
              interests: currentProfile.goals?.map((g) => g.name) ?? [],
              sports: currentProfile.sports?.map((s) => s.name) ?? [],
          }
        : null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Centered container for larger screens */}
            <div className="flex flex-col h-full w-full max-w-md mx-auto">
                {/* Header with filter buttons */}
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        type="button"
                        onClick={filterSheet.open}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border-secondary"
                    >
                        <img src="/icons/filter.svg" alt="Filter" width={20} height={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/notifications")}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border-secondary"
                    >
                        <img src="/icons/bell.svg" alt="Notifications" width={18} height={20} />
                    </button>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                            <div className="text-[14px] text-text-tertiary">
                                Loading...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                            <div className="text-[14px] text-red-500 mb-4">
                                An error occurred while loading
                            </div>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-bg-brand-solid text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    ) : hasMoreProfiles && currentUser ? (
                        <div className="flex-1 min-h-0">
                            <SwipeCard
                                user={currentUser}
                                onClick={handleCardClick}
                                onSwipeLeft={handleDislike}
                                onSwipeRight={handleLike}
                                onBack={handleBack}
                                onSuperLike={handleSuperLike}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                            <div className="text-[48px] mb-4">🎉</div>
                            <h2 className="text-[20px] font-medium text-text-primary mb-2">
                                All viewed!
                            </h2>
                            <p className="text-[14px] text-text-tertiary mb-6">
                                You have viewed all users in your area
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push("/home")}
                                className="px-6 py-3 bg-bg-brand-solid text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                            >
                                Browse events
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile Sheet */}
            <UserProfileSheet
                user={selectedUser}
                isOpen={isOpen}
                onClose={close}
                onMessage={handleMessage}
            />

            {/* People Filter Sheet */}
            <PeopleFilterSheet
                isOpen={filterSheet.isOpen}
                onClose={filterSheet.close}
                filters={filters}
                sports={sportsData?.sports ?? []}
                goals={goalsData?.goals ?? []}
                onSetGender={setGender}
                onSetAgeRange={setAgeRange}
                onSetDistanceKm={setDistanceKm}
                onToggleGoal={toggleGoal}
                onToggleSport={toggleSport}
                onToggleLanguage={toggleLanguage}
                onToggleChronotype={toggleChronotype}
                onSetHeightRange={setHeightRange}
                onSetWeightRange={setWeightRange}
                onReset={resetFilters}
                onApply={applyFilters}
            />
        </div>
    );
}

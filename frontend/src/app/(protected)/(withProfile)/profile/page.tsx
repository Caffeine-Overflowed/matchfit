"use client";

import Link from "next/link";
import { useProfile } from "@/features/auth";
import {
    ProfileHeader,
    EventListItem,
    EmptyEventsState,
    useMyEvents,
    type EventItem,
} from "@/features/profile";
import { Button } from "@/shared/components/ui/button";
import { EventStatus } from "@/shared/api/graphql";

export default function ProfilePage() {
    const { profile, isLoading: profileLoading } = useProfile();
    const { events, loading: eventsLoading } = useMyEvents({
        statuses: [EventStatus.Scheduled],
        limit: 10,
    });

    const loading = profileLoading || eventsLoading;

    // Map API events to UI format
    const mappedEvents: EventItem[] = events.map((event) => ({
        id: event.id,
        title: event.title,
        imageUrl: undefined, // API doesn't provide image yet
        startTime: event.startTime,
        participantsCount: event.participantsCount ?? 0,
        maxParticipants: event.maxParticipants ?? 10,
        difficulty: event.difficulty,
    }));

    if (loading && !profile) {
        return (
            <div className="flex flex-1 flex-col h-full items-center justify-center">
                <span className="text-text-tertiary">Loading...</span>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-1 flex-col h-full items-center justify-center px-4">
                <span className="text-text-tertiary">Profile not found</span>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col h-full overflow-y-auto">
            {/* Profile Header */}
            <ProfileHeader
                profile={{
                    name: profile.name,
                    avatarUrl: profile.avatarUrl,
                    locationName: profile.locationName ?? undefined,
                }}
            />

            {/* My Events Section */}
            <div className="flex-1 px-4 pb-6">
                {mappedEvents.length > 0 ? (
                    <>
                        <h2 className="text-[16px] font-medium text-text-primary mb-4">
                            My events
                        </h2>
                        <div className="flex flex-col gap-3">
                            {mappedEvents.map((event) => (
                                <EventListItem key={event.id} event={event} />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyEventsState />
                )}

                {/* Create Button */}
                <div className="mt-6">
                    <Button asChild className="w-full py-4 h-auto">
                        <Link href="/events/create">
                            <img
                                src="/icons/plus.svg"
                                alt=""
                                width={20}
                                height={20}
                                className="invert mr-[-4px]"
                            />
                            <span className="text-[16px] font-medium">Create</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

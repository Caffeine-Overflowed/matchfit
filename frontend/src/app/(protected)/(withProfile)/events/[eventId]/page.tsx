"use client";

import {useMemo} from "react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {HiChatBubbleOvalLeft, HiChevronLeft} from "react-icons/hi2";
import {useMutation} from "@apollo/client/react";
import {GoogleMap, MarkerF} from "@react-google-maps/api";
import {toast} from "sonner";
import {useEvent} from "@/features/events";
import {useSports} from "@/features/onboarding/hooks/use-sports";
import {useGoogleMaps} from "@/shared/providers/google-maps-provider";
import {Button} from "@/shared/components/ui/button";
import {DifficultyLevel, EventCategory, JoinEventDocument,} from "@/shared/api/graphql";

const CATEGORY_LABELS: Record<EventCategory, string> = {
    [EventCategory.Sport]: "Sport",
    [EventCategory.Trip]: "Trip",
    [EventCategory.Lecture]: "Lecture",
    [EventCategory.Workshop]: "Workshop",
};

const CATEGORY_ICONS: Record<EventCategory, string> = {
    [EventCategory.Sport]: "/icons/gym.svg",
    [EventCategory.Trip]: "/icons/backpack.svg",
    [EventCategory.Lecture]: "/icons/tribune.svg",
    [EventCategory.Workshop]: "/icons/workshop.svg",
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    [DifficultyLevel.Easy]: "Easy",
    [DifficultyLevel.Medium]: "Medium",
    [DifficultyLevel.Hard]: "Hard",
    [DifficultyLevel.NA]: "Not specified",
};

const DIFFICULTY_ICONS: Record<DifficultyLevel, string> = {
    [DifficultyLevel.Easy]: "/icons/difficulty-easy.svg",
    [DifficultyLevel.Medium]: "/icons/difficulty-medium.svg",
    [DifficultyLevel.Hard]: "/icons/difficulty-hard.svg",
    [DifficultyLevel.NA]: "",
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const {event, isLoading, error} = useEvent(eventId);
    const {sports} = useSports();
    const {isLoaded: mapsLoaded} = useGoogleMaps();
    const [joinEvent, {loading: joinLoading}] = useMutation(JoinEventDocument);

    const eventSports = useMemo(() => {
        if (!event?.sportIds || !sports.length) return [];
        return sports.filter((s) => event.sportIds.includes(s.id));
    }, [event?.sportIds, sports]);

    const formattedDate = useMemo(() => {
        if (!event?.startTime) return "";
        const date = new Date(event.startTime);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }, [event?.startTime]);

    const formattedTime = useMemo(() => {
        if (!event?.startTime) return "";
        const date = new Date(event.startTime);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [event?.startTime]);

    const handleJoin = async () => {
        if (event?.isHost) {
            router.push(`/events/${eventId}/edit`);
            return;
        } if (event?.isParticipant && event.chat) {
            router.push(`/chat/${event.chat.id}`);
            return;
        }

        try {
            await joinEvent({variables: {eventId}});
            router.push(`/chat/${event?.chat?.id}`);
        } catch (err) {
            console.error("Failed to join event:", err);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <span className="text-text-tertiary">Loading...</span>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white gap-4">
                <span className="text-text-tertiary">Event not found</span>
                <Link href="/home" className="text-brand-600">
                    Return to home
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Hero Image */}
                <div className="relative h-[400px] bg-gradient-to-br from-sky-300 to-sky-500">
                    {event.imageFileName && (
                        <img
                            src={event.imageFileName}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>

                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                    >
                        <HiChevronLeft className="h-5 w-5 text-white"/>
                    </button>

                    {/* Top right badges */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        {/* Share button */}
                        <button
                            onClick={handleShare}
                            className="flex h-8 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-2"
                        >
                            <img src="/icons/share.svg" alt="" width={16} height={16} className="invert"/>
                        </button>
                        {/* Category badge */}
                        <div
                            className="flex h-8 items-center gap-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-3">
                            <img src={CATEGORY_ICONS[event.category]} alt="" width={16} height={16}
                                   className="invert"/>
                            <span className="text-[14px] text-white">{CATEGORY_LABELS[event.category]}</span>
                        </div>
                    </div>

                    {/* Chat button */}
                    {
                        event.isParticipant && event.chat && (
                            <Link
                                href={`/chat/${event.chat.id}`}
                                className="absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-sm"
                            >
                                <HiChatBubbleOvalLeft className="h-4 w-4 text-white"/>
                            </Link>
                        )

                    }

                    {/* Title */}
                    <div className="absolute bottom-6 left-6 right-16 z-10">
                        <h1 className="text-[24px] font-medium text-white leading-tight">
                            {event.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 flex flex-col gap-4">
                    {/* Description */}
                    {event.description && (
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[16px] font-medium text-text-primary">
                                Event description
                            </h2>
                            <p className="text-[14px] text-text-secondary leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {/* Main info */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[16px] font-medium text-text-primary">
                            Main info
                        </h2>
                        <div className="flex flex-col gap-2">
                            {/* Difficulty and Sport */}
                            <div className="flex items-center gap-3">
                                {
                                    DifficultyLevel.NA !== event.difficulty && (
                                        <div className="flex items-center gap-1">
                                            <img src={DIFFICULTY_ICONS[event.difficulty]} alt="" width={16} height={16}/>
                                            <span className="text-[14px] text-text-secondary">
                                                {DIFFICULTY_LABELS[event.difficulty]}
                                            </span>
                                        </div>
                                    )
                                }
                                {eventSports.map((sport) => (
                                    <div key={sport.id} className="flex items-center gap-1">
                                        {sport.iconUrl && (
                                            <img src={sport.iconUrl} alt="" width={16} height={16}/>
                                        )}
                                        <span className="text-[14px] text-text-secondary">
                                            {sport.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Date and Time */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <img src="/icons/calendar.svg" alt="" width={16} height={16}/>
                                    <span className="text-[14px] text-text-secondary">{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <img src="/icons/time.svg" alt="" width={16} height={16}/>
                                    <span className="text-[14px] text-text-secondary">{formattedTime}</span>
                                </div>
                            </div>


                            {/* Participants */}
                            <div className="flex items-center gap-1">
                                <img src="/icons/users.svg" alt="" width={16} height={16}/>
                                <span className="text-[14px] text-text-secondary">
                                    {event.participantsCount ?? 0}
                                    {event.targetParticipants ? ` of ${event.targetParticipants}` : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Organizer */}
                    {event.host && (
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[16px] font-medium text-text-primary">
                                Organizer
                            </h2>
                            <Link
                                onClick={(e) => {

                                    e.preventDefault();
                                    // TODO: Open modal with organizer info

                                }}
                                href={`/profile/${event.host.id}`}
                                className="flex items-center gap-2 p-2 border border-border-secondary rounded-2xl"
                            >
                                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200">
                                    {event.host.avatarUrl ? (
                                        <img
                                            src={event.host.avatarUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium">
                                            {event.host.name?.[0] ?? "?"}
                                        </div>
                                    )}
                                </div>
                                <span className="flex-1 text-[16px] font-medium text-text-primary">
                                    {event.host.name ?? "Organizer"}
                                </span>
                                <img src="/icons/chevron-right.svg" alt="" width={20} height={20}/>
                            </Link>
                        </div>
                    )}

                    {/* Map */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[16px] font-medium text-text-primary">
                            Location
                        </h2>
                        <div className="h-[165px] rounded-xl overflow-hidden">
                            {mapsLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{width: "100%", height: "100%"}}
                                    center={{lat: event.lat, lng: event.lon}}
                                    zoom={15}
                                    options={{
                                        disableDefaultUI: true,
                                        zoomControl: false,
                                        gestureHandling: "none",
                                    }}
                                >
                                    <MarkerF position={{lat: event.lat, lng: event.lon}}/>
                                </GoogleMap>
                            ) : (
                                <div className="w-full h-full bg-gray-200 animate-pulse"/>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Join button */}
            <div
                className="fixed bottom-16 left-0 right-0 px-4 bg-gradient-to-t from-white via-white to-transparent pb-6">
                <div className="max-w-md mx-auto">
                    <Button
                        onClick={handleJoin}
                        disabled={joinLoading}
                        className="w-full h-12 rounded-xl text-[16px]"
                    >
                        {
                            event.isHost ? "Edit event" :
                                event.isParticipant ? "Go to chat" :
                                    joinLoading ? "Joining..." : "Join"
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { DifficultyLevel, type EventFragment } from "@/shared/api/graphql";

interface EventCardProps {
    event: EventFragment;
    onClick?: () => void;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; icon: string }> = {
    [DifficultyLevel.Easy]: { label: "Easy", icon: "/icons/difficulty-easy.svg" },
    [DifficultyLevel.Medium]: { label: "Medium", icon: "/icons/difficulty-medium.svg" },
    [DifficultyLevel.Hard]: { label: "Hard", icon: "/icons/difficulty-hard.svg" },
    [DifficultyLevel.NA]: { label: "", icon: "" },
};

function Badge({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-1">
            <img src={icon} alt="" width={16} height={16} className="shrink-0" />
            <span className="text-sm text-text-tertiary">{children}</span>
        </div>
    );
}

export function EventCard({ event, onClick }: EventCardProps) {
    const spotsAvailable = (event.maxParticipants ?? 0) - (event.participantsCount ?? 0);
    const spotsTotal = event.maxParticipants ?? 0;
    const difficulty = DIFFICULTY_CONFIG[event.difficulty];

    return (
        <button
            onClick={onClick}
            className="flex gap-3 w-full text-left hover:opacity-90 transition-opacity"
        >
            {/* Image */}
            <div className="relative shrink-0 w-[120px] h-[80px] bg-gray-200 rounded-xl overflow-hidden">
                {event.imageFileName && (
                    <img
                        src={event.imageFileName}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <h3 className="text-subtitle font-medium text-text-primary line-clamp-2 mb-2">
                    {event.title}
                </h3>

                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge icon="/icons/calendar.svg">
                        {formatDate(event.startTime)}
                    </Badge>
                    <Badge icon="/icons/clock.svg">
                        {formatTime(event.startTime)}
                    </Badge>
                    {spotsTotal > 0 && (
                        <Badge icon="/icons/users.svg">
                            {spotsAvailable} of {spotsTotal}
                        </Badge>
                    )}
                </div>

                {/* Difficulty */}
                {difficulty.label && (
                    <div className="flex items-center gap-1">
                        <img
                            src={difficulty.icon}
                            alt=""
                            width={16}
                            height={16}
                            className="shrink-0"
                        />
                        <span className="text-sm text-text-tertiary">{difficulty.label}</span>
                    </div>
                )}
            </div>
        </button>
    );
}

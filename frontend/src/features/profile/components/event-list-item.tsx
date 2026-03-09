"use client";

import Link from "next/link";
import { DifficultyLevel } from "@/shared/api/graphql";
import type { EventItem } from "../types";

interface EventListItemProps {
    event: EventItem;
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

function getDifficultyLabel(difficulty: DifficultyLevel): string {
    switch (difficulty) {
        case DifficultyLevel.Easy:
            return "Easy";
        case DifficultyLevel.Medium:
            return "Medium";
        case DifficultyLevel.Hard:
            return "Hard";
        default:
            return "Medium";
    }
}

function getDifficultyIcon(difficulty: DifficultyLevel): string {
    switch (difficulty) {
        case DifficultyLevel.Easy:
            return "/icons/difficulty-easy.svg";
        case DifficultyLevel.Medium:
            return "/icons/difficulty-medium.svg";
        case DifficultyLevel.Hard:
            return "/icons/difficulty-hard.svg";
        default:
            return "/icons/difficulty-medium.svg";
    }
}

export function EventListItem({ event }: EventListItemProps) {
    return (
        <Link
            href={`/events/${event.id}`}
            className="flex gap-3 items-start hover:bg-gray-50 transition-colors rounded-lg"
        >
            {/* Thumbnail */}
            <div className="relative h-[80px] w-[120px] shrink-0 rounded-2xl overflow-hidden bg-gray-200">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between h-[80px] flex-1 min-w-0 py-0.5">
                <h3 className="text-[14px] font-medium text-text-primary truncate">
                    {event.title}
                </h3>

                <div className="flex flex-col gap-2">
                    {/* Date, Time, Participants */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                            <img
                                src="/icons/calendar.svg"
                                alt=""
                                width={16}
                                height={16}
                                className="opacity-60"
                            />
                            <span className="text-[14px] text-text-tertiary">
                                {formatDate(event.startTime)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <img
                                src="/icons/clock.svg"
                                alt=""
                                width={16}
                                height={16}
                                className="opacity-60"
                            />
                            <span className="text-[14px] text-text-tertiary">
                                {formatTime(event.startTime)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <img
                                src="/icons/users.svg"
                                alt=""
                                width={16}
                                height={16}
                                className="opacity-60"
                            />
                            <span className="text-[14px] text-text-tertiary">
                                {event.participantsCount} of {event.maxParticipants}
                            </span>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="flex items-center gap-1">
                        <img
                            src={getDifficultyIcon(event.difficulty)}
                            alt=""
                            width={16}
                            height={16}
                        />
                        <span className="text-[14px] text-text-tertiary">
                            {getDifficultyLabel(event.difficulty)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

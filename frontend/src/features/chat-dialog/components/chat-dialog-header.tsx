"use client";

import {useRouter} from "next/navigation";
import {HiArrowLeft} from "react-icons/hi2";
import type {ChatInfo} from "../types";

function pluralizeParticipants(count: number): string {
    return count === 1 ? `${count} participant` : `${count} participants`;
}

interface ChatDialogHeaderProps {
    chat: ChatInfo;
}

export function ChatDialogHeader({chat}: ChatDialogHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3 py-2 sm:py-3 px-2 border-b border-gray-100">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
            >
                <HiArrowLeft className="h-4 w-4"/>
            </button>

            <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0">
                <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-full h-full rounded-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <h1 className="text-[15px] sm:text-[16px] font-medium text-text-primary truncate">
                    {chat.name}
                </h1>
                {chat.isGroup && (
                    <p className="text-[12px] text-text-tertiary">
                        {pluralizeParticipants(chat.participantsCount)}
                    </p>
                )}
            </div>
        </div>
    );
}

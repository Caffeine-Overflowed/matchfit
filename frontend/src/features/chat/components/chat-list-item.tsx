"use client";

import Link from "next/link";
import {HiCheck} from "react-icons/hi2";
import type {ChatMessage} from "../types";

interface ChatListItemProps {
    chat: ChatMessage;
}

export function ChatListItem({chat}: ChatListItemProps) {
    return (
        <Link
            href={`/chat/${chat.recipientId}`}
            className="flex items-center gap-3 sm:gap-4 px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0">
                <img
                    src={chat.recipientAvatar}
                    alt={chat.recipientName}
                    className="w-full h-full rounded-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] sm:text-[16px] font-medium text-text-primary truncate">
                        {chat.recipientName}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[13px] sm:text-[14px] text-text-tertiary">
                            {chat.time}
                        </span>
                        {chat.isRead && (
                            <div className="flex -space-x-1.5">
                                <HiCheck className="h-4 w-4 text-brand-600"/>
                                <HiCheck className="h-4 w-4 text-brand-600"/>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[13px] sm:text-[14px] text-text-tertiary truncate">
                        {chat.lastMessage}
                    </p>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                        <div
                            className="h-[18px] min-w-[18px] px-1.5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-medium text-white">
                                {chat.unreadCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

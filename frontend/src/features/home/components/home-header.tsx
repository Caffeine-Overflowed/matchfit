"use client";

import { HiMapPin } from "react-icons/hi2";

interface HomeHeaderProps {
    userName: string;
    userLocation: string;
    unreadNotificationsCount?: number;
    onNotificationsClick?: () => void;
    onLocationClick?: () => void;
}

export function HomeHeader({ userName, userLocation, unreadNotificationsCount, onNotificationsClick, onLocationClick }: HomeHeaderProps) {
    return (
        <header className="px-4 md:px-0 pt-4 pb-2">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-text-secondary">Welcome Back!</p>
                    <h1 className="text-display-xs font-medium text-text-primary truncate">{userName}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={onLocationClick}
                        className="flex items-center gap-2 bg-bg-tertiary rounded-full px-3 py-2 hover:bg-gray-200 transition-colors"
                    >
                        <HiMapPin className="h-4 w-4 text-text-primary shrink-0" />
                        <span className="text-sm text-text-primary hidden sm:inline">{userLocation}</span>
                    </button>
                    <button
                        onClick={onNotificationsClick}
                        className="relative flex items-center justify-center bg-bg-tertiary rounded-full p-2 hover:bg-gray-200 transition-colors"
                    >
                        <img src="/icons/bell.svg" alt="" width={18} height={20} />
                        {!!unreadNotificationsCount && unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-bg-brand-solid text-white text-xs font-medium rounded-full px-1">
                                {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}

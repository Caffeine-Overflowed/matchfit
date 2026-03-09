"use client";

import { useRouter } from "next/navigation";
import { HiArrowLeft, HiCheck } from "react-icons/hi2";

interface NotificationsHeaderProps {
    onMarkAllRead?: () => void;
    hasUnread?: boolean;
}

export function NotificationsHeader({ onMarkAllRead, hasUnread }: NotificationsHeaderProps) {
    const router = useRouter();

    return (
        <header className="flex items-center justify-between px-4 py-3 border-b border-border-secondary">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-tertiary hover:bg-gray-200 transition-colors"
            >
                <HiArrowLeft className="h-5 w-5 text-text-primary" />
            </button>

            <h1 className="text-lg font-medium text-text-primary">
                Notifications
            </h1>

            {hasUnread ? (
                <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-tertiary hover:bg-gray-200 transition-colors"
                >
                    <HiCheck className="h-5 w-5 text-text-primary" />
                </button>
            ) : (
                <div className="w-10" />
            )}
        </header>
    );
}

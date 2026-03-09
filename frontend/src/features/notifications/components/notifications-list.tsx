"use client";

import { NotificationItem } from "./notification-item";
import type { Notification } from "../types";

interface NotificationsListProps {
    notifications: Notification[];
    onNotificationClick?: (notification: Notification) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
}

export function NotificationsList({
    notifications,
    onNotificationClick,
    onLoadMore,
    hasMore,
    isLoading,
}: NotificationsListProps) {
    if (notifications.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <span className="text-4xl mb-4">🔔</span>
                <p className="text-text-secondary text-center">
                    No notifications yet
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border-secondary">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={onNotificationClick}
                />
            ))}

            {hasMore && (
                <div className="p-4 flex justify-center">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className="text-sm text-fg-brand-primary hover:underline disabled:opacity-50"
                    >
                        {isLoading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}

            {isLoading && notifications.length === 0 && (
                <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                            <div className="size-10 rounded-full bg-bg-tertiary" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-bg-tertiary rounded w-1/3" />
                                <div className="h-3 bg-bg-tertiary rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

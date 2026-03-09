"use client";

import { useRouter } from "next/navigation";
import { NotificationsHeader, NotificationsList, useNotifications } from "@/features/notifications";
import { NotificationTypeFragment } from "@/shared/api/graphql";

export default function NotificationsPage() {
    const router = useRouter();
    const {
        notifications,
        isLoading,
        hasMore,
        loadMore,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const hasUnread = notifications.some((n) => !n.isRead);

    const handleNotificationClick = async (notification: NotificationTypeFragment) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        const payload = notification.payload; // Make sure payload exists in the fragment
        if (payload?.eventId) router.push(`/events/${payload.eventId}`);
        else if (payload?.chatId) router.push(`/chat/${payload.chatId}`);
        else if (payload?.userId) router.push(`/people/${payload.userId}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-bg-primary">
            <NotificationsHeader
                onMarkAllRead={markAllAsRead}
                hasUnread={hasUnread}
            />

            <div className="flex-1 overflow-y-auto p-4">
                <NotificationsList
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    isLoading={isLoading}
                />

                {notifications.length >= 20 && (
                    <button
                        onClick={loadMore}
                        className="w-full py-4 text-sm text-gray-500 hover:text-black"
                    >
                        Load more
                    </button>
                )}
            </div>
        </div>
    );
}
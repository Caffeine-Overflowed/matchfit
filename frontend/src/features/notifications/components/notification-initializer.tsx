"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { useNotificationStore } from "@/shared/store/notification-store";
import {
    NotificationsDocument,
    UnreadNotificationsCountDocument
} from "@/shared/api/graphql";

export function NotificationInitializer() {
    const { setNotifications, setUnreadCount } = useNotificationStore();
    const prevCountRef = useRef<number | null>(null);

    const { data: listData } = useQuery(NotificationsDocument, {
        variables: { params: { limit: 20, offset: 0 } },
        pollInterval: 10000, // Poll every 10 seconds
    });

    const { data: countData } = useQuery(UnreadNotificationsCountDocument, {
        pollInterval: 10000, // Poll every 10 seconds
    });

    // Sync notifications list
    useEffect(() => {
        if (listData?.notifications?.items) {
            const firstPage = listData.notifications.items;
            // Merge instead of replace: the poll only fetches the first page,
            // so a plain replace would wipe pages loaded via loadMore.
            // getState() avoids depending on the store list (would loop).
            const existing = useNotificationStore.getState().notifications;
            const firstPageIds = new Set(firstPage.map((n) => n.id));
            const older = existing.filter((n) => !firstPageIds.has(n.id));
            setNotifications([...firstPage, ...older]);
        }
    }, [listData, setNotifications]);

    // Sync counter
    useEffect(() => {
        if (countData?.unreadNotificationsCount !== undefined) {
            setUnreadCount(countData.unreadNotificationsCount);
        }
    }, [countData, setUnreadCount]);

    return null;
}
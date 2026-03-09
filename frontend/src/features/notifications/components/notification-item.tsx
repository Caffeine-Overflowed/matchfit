"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { cx } from "@/shared/utils/cx";
import type { Notification } from "../types";

interface NotificationItemProps {
    notification: Notification;
    onClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: enUS,
    });

    return (
        <button
            type="button"
            onClick={() => onClick?.(notification)}
            className={cx(
                "flex items-start gap-3 w-full p-4 text-left transition-colors",
                "hover:bg-bg-tertiary",
                !notification.isRead && "bg-bg-tertiary/50"
            )}
        >
            {/* Avatar placeholder */}
            <div className="size-10 rounded-full bg-bg-brand-solid/10 flex items-center justify-center shrink-0">
                <span className="text-lg">🔔</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={cx(
                        "text-sm truncate",
                        notification.isRead ? "text-text-secondary" : "text-text-primary font-medium"
                    )}>
                        {getNotificationTitle(notification.kind)}
                    </p>
                    <span className="text-xs text-text-tertiary shrink-0">{timeAgo}</span>
                </div>
                <p className={cx(
                    "text-sm line-clamp-2",
                    notification.isRead ? "text-text-tertiary" : "text-text-secondary"
                )}>
                    {notification.text}
                </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
                <div className="size-2 rounded-full bg-bg-brand-solid shrink-0 mt-2" />
            )}
        </button>
    );
}

function getNotificationTitle(kind: string): string {
    const titles: Record<string, string> = {
        EVENT_REMINDER: "Reminder",
        EVENT_CANCELLED: "Cancelled",
        EVENT_STATUS_CHANGED: "Status changed",
        NEW_PARTICIPANT: "New participant",
        PARTICIPANT_LEFT: "Participant left",
        NEW_MESSAGE: "New message",
        MATCH: "Match",
        SYSTEM: "System",
    };
    return titles[kind] || "Notification";
}

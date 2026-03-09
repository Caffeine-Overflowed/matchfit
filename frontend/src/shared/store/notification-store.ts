import { create } from 'zustand';
import { NotificationTypeFragment } from "@/shared/api/graphql";

interface NotificationState {
    notifications: NotificationTypeFragment[];
    unreadCount: number;
    setNotifications: (items: NotificationTypeFragment[]) => void;
    addNotifications: (items: NotificationTypeFragment[]) => void; // For pagination
    addNotification: (item: NotificationTypeFragment) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: (items) => set({ notifications: items }),
    addNotifications: (items) => set((state) => ({
        notifications: [...state.notifications, ...items]
    })),
    addNotification: (item) => set((state) => ({
        // Check for duplicates (if subscription and query fired simultaneously)
        notifications: state.notifications.some(n => n.id === item.id)
            ? state.notifications
            : [item, ...state.notifications],
        unreadCount: state.unreadCount + 1
    })),
    markRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
    })),
    markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
    })),
    setUnreadCount: (count) => set({ unreadCount: count }),
}));
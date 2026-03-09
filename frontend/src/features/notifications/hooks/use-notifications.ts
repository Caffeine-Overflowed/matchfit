import {useNotificationStore} from "@/shared/store/notification-store";
import {useMutation, useQuery} from "@apollo/client/react";
import {MarkAllNotificationsReadDocument, MarkNotificationReadDocument, NotificationsDocument} from "@/shared/api";

export function useNotifications() {
    const {
        notifications,
        markRead: markInStore,
        markAllRead: markAllInStore,
        addNotifications: appendToStore
    } = useNotificationStore();

    const [markReadApi] = useMutation(MarkNotificationReadDocument);
    const [markAllReadApi] = useMutation(MarkAllNotificationsReadDocument);

    // Connect query to have access to its state (loading, hasMore)
    const {data, loading, fetchMore} = useQuery(NotificationsDocument, {
        variables: {params: {limit: 20, offset: 0}},
        // We don't skip the query (skip: false) so Apollo tracks metadata
    });

    const hasMore = data?.notifications.hasMore ?? false;

    const markAsRead = async (notificationId: string) => {
        markInStore(notificationId);
        await markReadApi({variables: {data: {notificationId}}});
    };

    const markAllAsRead = async () => {
        markAllInStore();
        await markAllReadApi();
    }

    const loadMore = async () => {
        if (!hasMore || loading) return;

        const result = await fetchMore({
            variables: {params: {limit: 20, offset: notifications.length}}
        });

        if (result.data?.notifications?.items) {
            appendToStore(result.data.notifications.items);
        }
    };

    return {
        notifications,
        isLoading: loading, // The parameter for the list
        hasMore,            // The parameter for the list
        loadMore,
        markAsRead,
        markAllAsRead
    };
}

export function useUnreadNotificationsCount() {
    // Take only one value so the component doesn't re-render unnecessarily
    const count = useNotificationStore((state) => state.unreadCount);

    return {
        count,
        isLoading: false, // Now this is always false after initialization since data is in store
    };
}
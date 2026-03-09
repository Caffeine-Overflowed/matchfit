"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HiPlus } from "react-icons/hi2";
import { BottomNav } from "@/shared/components/navigation/bottom-nav";
import { FullPageSpinner } from "@/shared/components/ui/spinner";
import { useProfile } from "@/features/auth";
import { NotificationInitializer } from "@/features/notifications/components/notification-initializer";

export default function WithProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { hasProfile, isLoading } = useProfile();

    const showFab = pathname !== "/people" && !pathname.startsWith("/profile") && !pathname.startsWith("/events");

    useEffect(() => {
        if (!isLoading && !hasProfile) {
            router.replace("/onboarding");
        }
    }, [isLoading, hasProfile, router]);

    if (isLoading) {
        return (
            <div suppressHydrationWarning>
                <FullPageSpinner />
            </div>
        );
    }

    if (!hasProfile) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col pb-16">
            <main className="flex-1 overflow-hidden mx-auto max-w-md w-full">{children}</main>
            <NotificationInitializer />

            {/* FAB - Create Event */}
            {showFab && (
                <Link
                    href="/events/create"
                    className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 shadow-lg active:bg-brand-700 transition-colors"
                >
                    <HiPlus className="h-7 w-7 text-white" />
                </Link>
            )}

            <BottomNav />
        </div>
    );
}

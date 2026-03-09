"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/shared/store/user-store";
import { GoogleMapsProvider } from "@/shared/providers/google-maps-provider";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isAuthorized = useUserStore((s) => s.isAuthorized);

    useEffect(() => {
        if (!isAuthorized) {
            router.replace("/auth/login");
        }
    }, [isAuthorized, router]);

    if (!isAuthorized) {
        return null;
    }

    return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}

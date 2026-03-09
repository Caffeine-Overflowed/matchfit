"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/shared/store/user-store";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isAuthorized = useUserStore((s) => s.isAuthorized);

    useEffect(() => {
        if (isAuthorized) {
            router.replace("/home");
        }
    }, [isAuthorized, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <main className="w-full max-w-md px-4">{children}</main>
        </div>
    );
}

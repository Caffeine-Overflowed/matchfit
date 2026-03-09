"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/features/auth";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { hasProfile, isLoading } = useProfile();

    useEffect(() => {
        if (!isLoading && hasProfile) {
            router.replace("/home");
        }
    }, [isLoading, hasProfile, router]);

    if (isLoading || hasProfile) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
                {children}
            </main>
        </div>
    );
}

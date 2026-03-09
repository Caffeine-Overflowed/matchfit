"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiUsers, HiChatBubbleLeftRight, HiUser } from "react-icons/hi2";
import { cx } from "@/shared/utils/cx";

const navItems = [
    { href: "/home", label: "Home", icon: HiHome },
    { href: "/people", label: "People", icon: HiUsers },
    { href: "/chat", label: "Chat", icon: HiChatBubbleLeftRight },
    { href: "/profile", label: "Profile", icon: HiUser },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-secondary bg-white pb-safe">
            <div className="mx-auto flex h-16 max-w-md items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cx(
                                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-fg-brand-primary"
                                    : "text-text-quaternary hover:text-text-primary"
                            )}
                        >
                            <Icon className="h-6 w-6" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

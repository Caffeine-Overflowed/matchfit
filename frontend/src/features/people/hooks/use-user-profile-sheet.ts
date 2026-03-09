"use client";

import { useState, useCallback } from "react";
import type { UserProfile } from "../types";

export function useUserProfileSheet() {
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback((user: UserProfile) => {
        setSelectedUser(user);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        selectedUser,
        isOpen,
        open,
        close,
    };
}

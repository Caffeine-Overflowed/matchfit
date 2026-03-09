"use client";

import { useEffect, useCallback } from "react";
import { HiMapPin } from "react-icons/hi2";
import { cx } from "@/shared/utils/cx";
import { ProfileSection } from "./profile-section";
import { TagList, Tag } from "./tag-list";
import type { UserProfile } from "../types";

interface UserProfileSheetProps {
    user: UserProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onMessage?: (userId: string) => void;
}

export function UserProfileSheet({ user, isOpen, onClose, onMessage }: UserProfileSheetProps) {
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!user) return null;

    return (
        <div
            className={cx(
                "fixed inset-0 z-[55] transition-all duration-300",
                isOpen ? "visible" : "invisible"
            )}
        >
            {/* Backdrop */}
            <div
                className={cx(
                    "absolute inset-0 bg-black/50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleBackdropClick}
            />

            {/* Sheet */}
            <div
                className={cx(
                    "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-white rounded-t-3xl transition-transform duration-300 max-h-[80vh] overflow-hidden",
                    isOpen ? "" : "translate-y-full"
                )}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-40px)]">
                    {/* Photo Section */}
                    <div className="mx-4 mb-4 bg-bg-tertiary rounded-xl overflow-hidden">
                        <div className="relative h-[300px] sm:h-[400px] bg-bg-tertiary">
                            {/* Location & Distance */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur rounded-full px-2 py-1">
                                    <HiMapPin className="h-4 w-4 text-text-primary" />
                                    <span className="text-sm text-text-primary">{user.location}</span>
                                </div>
                                {user.distance && (
                                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur rounded-full px-2 py-1">
                                        <span className="text-sm text-text-primary">{user.distance}</span>
                                    </div>
                                )}
                            </div>

                            {/* Name at bottom */}
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-display-xs font-medium text-text-primary">
                                    {user.name} {user.age}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {user.bio && (
                        <ProfileSection title="Description">
                            <div className="bg-bg-secondary rounded-lg px-4 py-3">
                                <p className="text-sm text-text-secondary">{user.bio}</p>
                            </div>
                        </ProfileSection>
                    )}

                    {/* Goals */}
                    {user.goals && user.goals.length > 0 && (
                        <ProfileSection title="Goals:">
                            <div className="flex flex-col gap-2">
                                {user.goals.map((goal) => (
                                    <div key={goal.id} className="bg-bg-secondary rounded-xl p-4 flex gap-3">
                                        <div className="shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                                            <span className="text-lg">{goal.icon}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-subtitle font-medium text-text-primary">{goal.title}</h4>
                                            <p className="text-sm text-text-secondary">{goal.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ProfileSection>
                    )}

                    {/* Interests */}
                    {user.interests.length > 0 && (
                        <ProfileSection title="Interests">
                            <TagList items={user.interests} />
                        </ProfileSection>
                    )}

                    {/* Basic Info */}
                    {user.basicInfo && (
                        <ProfileSection title="Basic Info">
                            <div className="flex flex-wrap gap-2">
                                {user.basicInfo.height && (
                                    <Tag icon="📏" label={`${user.basicInfo.height} cm`} />
                                )}
                                {user.basicInfo.weight && (
                                    <Tag icon="⚖️" label={`${user.basicInfo.weight} kg`} />
                                )}
                                {user.basicInfo.chronotype && (
                                    <Tag icon="🕐" label={user.basicInfo.chronotype} />
                                )}
                            </div>
                        </ProfileSection>
                    )}

                    {/* Languages */}
                    {user.languages && user.languages.length > 0 && (
                        <ProfileSection title="Languages">
                            <TagList items={user.languages.map((l) => `🌐 ${l}`)} />
                        </ProfileSection>
                    )}

                    {/* Places */}
                    {user.places && user.places.length > 0 && (
                        <ProfileSection title="Places">
                            <TagList items={user.places.map((p) => `📍 ${p}`)} />
                        </ProfileSection>
                    )}

                    {/* Action Button */}
                    <div className="mx-4 mt-4 mb-8">
                        <button
                            onClick={() => onMessage?.(user.id)}
                            className="w-full flex items-center justify-center gap-2 bg-bg-brand-solid text-white rounded-full py-4 font-medium text-subtitle hover:bg-brand-700 transition-colors active:bg-brand-800"
                        >
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


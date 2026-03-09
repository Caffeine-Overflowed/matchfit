"use client";

import { HiMapPin, HiChatBubbleLeft } from "react-icons/hi2";
import type { UserProfile } from "../types";

interface UserCardProps {
    user: UserProfile;
    onClick: () => void;
    onMessageClick: () => void;
}

export function UserCard({ user, onClick, onMessageClick }: UserCardProps) {
    return (
        <button
            onClick={onClick}
            className="flex gap-3 bg-bg-tertiary rounded-2xl p-4 text-left w-full transition-colors hover:bg-gray-200 active:bg-gray-300"
        >
            {/* Avatar */}
            <div className="shrink-0 w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-xl font-medium text-text-secondary">
                {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                    user.name.charAt(0)
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-subtitle font-medium text-text-primary truncate">
                            {user.name}, {user.age}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <div className="flex items-center gap-1">
                                <HiMapPin className="h-3.5 w-3.5 text-text-quaternary shrink-0" />
                                <span className="text-small text-text-secondary truncate">
                                    {user.location}
                                </span>
                            </div>
                            {user.distance && (
                                <span className="text-small text-text-quaternary">
                                    {user.distance}
                                </span>
                            )}
                        </div>
                    </div>
                    <div
                        role="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMessageClick();
                        }}
                        className="shrink-0 flex items-center justify-center bg-bg-brand-solid rounded-full p-2.5 hover:bg-brand-700 transition-colors"
                    >
                        <HiChatBubbleLeft className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Interests */}
                {user.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {user.interests.slice(0, 3).map((label, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-bg-primary px-2 py-1 rounded-full text-text-secondary"
                            >
                                {label}
                            </span>
                        ))}
                        {user.interests.length > 3 && (
                            <span className="text-xs text-text-quaternary px-1">
                                +{user.interests.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
}

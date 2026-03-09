"use client";

import Link from "next/link";
import type { ProfileInfo } from "../types";

interface ProfileHeaderProps {
    profile: ProfileInfo;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <div className="px-4 py-4">
            {/* Avatar and Info */}
            <div className="flex items-center gap-3">
                <div className="relative h-[81px] w-[81px] shrink-0">
                    <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className="text-[24px] font-medium text-text-primary leading-tight">
                        {profile.name}
                    </h1>
                    {profile.locationName && (
                        <span className="text-[14px] text-text-primary">
                            {profile.locationName}
                        </span>
                    )}
                </div>
            </div>

            {/* Edit Profile Button */}
            <Link
                href="/profile/edit"
                className="mt-4 flex items-center justify-center gap-2 w-full py-4 px-8 border border-border-secondary rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
                <img
                    src="/icons/edit.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-80"
                />
                <span className="text-[16px] font-medium text-text-primary">
                    Edit Profile
                </span>
            </Link>
        </div>
    );
}

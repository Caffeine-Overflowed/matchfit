"use client";

import { toast } from "sonner";
import {
    HiArrowUturnLeft,
    HiXMark,
    HiStar,
    HiHeart,
    HiBolt,
} from "react-icons/hi2";

interface SwipeActionsProps {
    onDislike: () => void;
    onLike: () => void;
}

export function SwipeActions({ onDislike, onLike }: SwipeActionsProps) {
    const handleBack = () => {
        toast("Feature not supported yet", {
            description: "Return to previous profile will be available soon",
        });
    };

    const handleSuperLike = () => {
        toast("Feature not supported yet", {
            description: "Super like will be available soon",
        });
    };

    return (
        <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Back button */}
            <button
                type="button"
                onClick={handleBack}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
            >
                <HiArrowUturnLeft className="h-5 w-5" />
            </button>

            {/* Dislike button */}
            <button
                type="button"
                onClick={onDislike}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-500 transition-colors"
            >
                <HiXMark className="h-7 w-7" />
            </button>

            {/* Super like button (center) */}
            <button
                type="button"
                onClick={handleSuperLike}
                className="flex h-16 w-16 sm:h-[72px] sm:w-[72px] items-center justify-center rounded-full bg-bg-accent text-gray-900 hover:opacity-80 transition-opacity"
            >
                <HiStar className="h-8 w-8" />
            </button>

            {/* Like button */}
            <button
                type="button"
                onClick={onLike}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-500 transition-colors"
            >
                <HiHeart className="h-7 w-7" />
            </button>

            {/* Boost button */}
            <button
                type="button"
                onClick={handleSuperLike}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
            >
                <HiBolt className="h-5 w-5" />
            </button>
        </div>
    );
}

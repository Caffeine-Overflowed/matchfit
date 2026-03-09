"use client";

import {useCallback} from "react";
import {useSwipeGesture} from "@/features/people";
import {CardInfoBadge} from "./card-info-badge";
import {SwipeIndicator} from "./swipe-indicator";
import type {UserProfile} from "../types";

interface SwipeCardProps {
    user: UserProfile;
    onClick: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onBack?: () => void;
    onSuperLike?: () => void;
}

const SWIPE_THRESHOLD = 100;

export function SwipeCard({user, onClick, onSwipeLeft, onSwipeRight, onBack, onSuperLike}: SwipeCardProps) {
    const {offset, isDragging, isFlying, isHidden, hasMoved, triggerSwipe, handlers} = useSwipeGesture({
        threshold: SWIPE_THRESHOLD,
        onSwipeLeft,
        onSwipeRight,
    });

    const handleClick = useCallback(() => {
        if (!hasMoved && !isFlying) {
            onClick();
        }
    }, [hasMoved, isFlying, onClick]);

    const handleDislike = useCallback(() => {
        triggerSwipe("left");
    }, [triggerSwipe]);

    const handleLike = useCallback(() => {
        triggerSwipe("right");
    }, [triggerSwipe]);

    const rotation = offset.x * 0.05;

    return (
        <div
            className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-200 cursor-grab active:cursor-grabbing select-none"
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
                opacity: isHidden ? 0 : 1,
            }}
            {...handlers}
            onClick={handleClick}
        >
            {/* Swipe indicators */}
            {offset.x > 30 && (
                <SwipeIndicator type="like" opacity={Math.min(1, offset.x / SWIPE_THRESHOLD)}/>
            )}
            {offset.x < -30 && (
                <SwipeIndicator type="nope" opacity={Math.min(1, Math.abs(offset.x) / SWIPE_THRESHOLD)}/>
            )}

            {/* Photo */}
            <CardPhoto avatar={user.avatar} name={user.name}/>

            {/* Top info bar */}
            <div className="absolute top-6 left-6 right-6 flex items-center gap-4">
                <CardInfoBadge icon="city">{user.location}</CardInfoBadge>
                <CardInfoBadge icon="location">{user.distance}</CardInfoBadge>
                {user.goal && <CardInfoBadge icon="goal">{user.goal}</CardInfoBadge>}
            </div>

            {/* Bottom gradient */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)"
                }}
            />

            {/* Bottom info and actions */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-3">
                {/* User info */}
                <CardBottomInfo user={user}/>

                {/* Action buttons */}
                <CardActions
                    onBack={onBack}
                    onDislike={handleDislike}
                    onSuperLike={onSuperLike}
                    onLike={handleLike}
                />
            </div>
        </div>
    );
}

function CardPhoto({avatar, name}: { avatar?: string | null; name: string }) {
    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                className="object-cover pointer-events-none"
                draggable={false}
            />
        );
    }
    return <div className="absolute inset-0 bg-gradient-to-b from-brand-400 to-brand-600"/>;
}

function CardBottomInfo({user}: { user: UserProfile }) {
    return (
        <div className="mb-3">
            <h2 className="text-[24px] font-medium text-white">
                {user.name} {user.age}
            </h2>
            <div className="flex flex-wrap gap-[7px] mt-3">
                {user.interests.slice(0, 4).map((interest, index) => (
                    <InterestTag key={index} interest={interest}/>
                ))}
            </div>
        </div>
    );
}

function InterestTag({interest}: { interest: string }) {
    return (
        <div
            className="flex items-center gap-2.5 px-3 py-2 bg-white/20 backdrop-blur-[5.8px] rounded-full border border-white/30">
            <span className="text-[14px] text-white">{interest}</span>
        </div>
    );
}

interface CardActionsProps {
    onBack?: () => void;
    onDislike?: () => void;
    onSuperLike?: () => void;
    onLike?: () => void;
}

function CardActions({onBack, onDislike, onSuperLike, onLike}: CardActionsProps) {
    const handleClick = (e: React.MouseEvent, callback?: () => void) => {
        e.stopPropagation();
        callback?.();
    };

    return (
        <div className="flex items-center justify-between pointer-events-auto">
            {/* Left group */}
            <div className="flex items-center gap-3">
                {/* Back - small */}
                <button
                    type="button"
                    onClick={(e) => handleClick(e, onBack)}
                    className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/90 text-gray-400 hover:bg-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/>
                    </svg>
                </button>

                {/* Dislike - big */}
                <button
                    type="button"
                    onClick={(e) => handleClick(e, onDislike)}
                    className="flex h-[53px] w-[53px] items-center justify-center rounded-full bg-white text-red-500 hover:bg-red-50 transition-colors shadow-lg"
                >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {/* Right group */}
            <div className="flex items-center gap-3">
                {/* Like - big */}
                <button
                    type="button"
                    onClick={(e) => handleClick(e, onLike)}
                    className="flex h-[53px] w-[53px] items-center justify-center rounded-full bg-white text-green-500 hover:bg-green-50 transition-colors shadow-lg"
                >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>

                {/* Super like - small */}
                <button
                    type="button"
                    onClick={(e) => handleClick(e, onSuperLike)}
                    className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/90 text-blue-500 hover:bg-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

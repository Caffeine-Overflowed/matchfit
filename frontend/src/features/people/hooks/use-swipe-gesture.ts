"use client";

import { useState, useRef, useCallback } from "react";

interface SwipeGestureConfig {
    threshold?: number;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

const FLY_AWAY_DISTANCE = 600;
const FLY_AWAY_DURATION = 250;

export function useSwipeGesture({
    threshold = 100,
    onSwipeLeft,
    onSwipeRight,
}: SwipeGestureConfig) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isFlying, setIsFlying] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    const flyAway = useCallback((direction: "left" | "right", callback?: () => void) => {
        setIsFlying(true);
        setOffset({
            x: direction === "right" ? FLY_AWAY_DISTANCE : -FLY_AWAY_DISTANCE,
            y: -100,
        });

        setTimeout(() => {
            setIsHidden(true);
            callback?.();

            // Small delay then reset for new card
            setTimeout(() => {
                setOffset({ x: 0, y: 0 });
                setIsFlying(false);
                setIsHidden(false);
            }, 50);
        }, FLY_AWAY_DURATION);
    }, []);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        if (isFlying) return;
        setIsDragging(true);
        hasMoved.current = false;
        startPos.current = { x: clientX, y: clientY };
    }, [isFlying]);

    const handleMove = useCallback(
        (clientX: number, clientY: number) => {
            if (!isDragging || isFlying) return;

            const deltaX = clientX - startPos.current.x;
            const deltaY = clientY - startPos.current.y;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                hasMoved.current = true;
            }

            setOffset({ x: deltaX, y: deltaY * 0.3 });
        },
        [isDragging, isFlying]
    );

    const handleEnd = useCallback(() => {
        if (!isDragging || isFlying) return;
        setIsDragging(false);

        if (offset.x > threshold) {
            flyAway("right", onSwipeRight);
        } else if (offset.x < -threshold) {
            flyAway("left", onSwipeLeft);
        } else {
            setOffset({ x: 0, y: 0 });
        }
    }, [isDragging, isFlying, offset.x, threshold, onSwipeLeft, onSwipeRight, flyAway]);

    const triggerSwipe = useCallback((direction: "left" | "right") => {
        if (isFlying) return;
        const callback = direction === "right" ? onSwipeRight : onSwipeLeft;
        flyAway(direction, callback);
    }, [isFlying, onSwipeLeft, onSwipeRight, flyAway]);

    const getMouseHandlers = () => ({
        onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX, e.clientY),
        onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX, e.clientY),
        onMouseUp: handleEnd,
        onMouseLeave: () => {
            if (isDragging) handleEnd();
        },
    });

    const getTouchHandlers = () => ({
        onTouchStart: (e: React.TouchEvent) => {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        },
        onTouchMove: (e: React.TouchEvent) => {
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        },
        onTouchEnd: handleEnd,
    });

    return {
        offset,
        isDragging,
        isFlying,
        isHidden,
        hasMoved: hasMoved.current,
        triggerSwipe,
        handlers: {
            ...getMouseHandlers(),
            ...getTouchHandlers(),
        },
    };
}

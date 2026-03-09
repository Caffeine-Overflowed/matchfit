"use client";

interface SwipeIndicatorProps {
    type: "like" | "nope";
    opacity: number;
}

export function SwipeIndicator({ type, opacity }: SwipeIndicatorProps) {
    const isLike = type === "like";

    return (
        <div
            className={`absolute top-8 z-10 px-4 py-2 border-4 rounded-lg ${
                isLike
                    ? "left-4 border-green-500 rotate-[-20deg]"
                    : "right-4 border-red-500 rotate-[20deg]"
            }`}
            style={{ opacity }}
        >
            <span className={`text-2xl font-bold ${isLike ? "text-green-500" : "text-red-500"}`}>
                {isLike ? "LIKE" : "NOPE"}
            </span>
        </div>
    );
}

"use client";

import Link from "next/link";
import type {NewMatch} from "../types";

interface NewMatchesCarouselProps {
    matches: NewMatch[];
}

export function NewMatchesCarousel({matches}: NewMatchesCarouselProps) {
    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[14px] sm:text-[16px] font-medium text-text-primary">
                    New match
                </h2>
                <button
                    type="button"
                    className="text-[13px] sm:text-[14px] font-medium text-brand-600 hover:text-brand-700"
                >
                    View More
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {matches.map((match) => (
                    <Link
                        key={match.id}
                        href={`/chat/${match.id}`}
                        className="flex flex-col items-center gap-1 shrink-0"
                    >
                        <div
                            className={`relative h-[100px] w-[75px] sm:h-[110px] sm:w-[82px] rounded-2xl overflow-hidden ${
                                match.isNew
                                    ? "ring-2 ring-brand-600"
                                    : ""
                            }`}
                        >
                            <img
                                src={match.avatar}
                                alt={match.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-[13px] sm:text-[14px] font-medium text-text-primary">
                            {match.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

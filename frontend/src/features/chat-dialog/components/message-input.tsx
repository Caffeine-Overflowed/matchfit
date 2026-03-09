"use client";

import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi2";

interface MessageInputProps {
    onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
    const [text, setText] = useState("");

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-t border-border-secondary bg-white">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                className="flex-1 h-10 px-4 bg-bg-tertiary rounded-full text-[14px] text-text-primary placeholder:text-text-placeholder outline-none focus:ring-2 focus:ring-brand-600/20"
            />

            <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40 transition-opacity shrink-0"
            >
                <HiPaperAirplane className="h-5 w-5" />
            </button>
        </div>
    );
}

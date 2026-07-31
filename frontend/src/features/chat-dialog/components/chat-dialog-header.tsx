"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {HiArrowLeft, HiOutlineTrash} from "react-icons/hi2";
import {toast} from "sonner";
import type {ChatInfo} from "../types";
import {useDeleteChat} from "../hooks";

function pluralizeParticipants(count: number): string {
    return count === 1 ? `${count} participant` : `${count} participants`;
}

interface ChatDialogHeaderProps {
    chatId: string;
    chat: ChatInfo;
}

export function ChatDialogHeader({chatId, chat}: ChatDialogHeaderProps) {
    const router = useRouter();
    const {deleteChat, loading} = useDeleteChat();
    const [confirming, setConfirming] = useState(false);

    const handleDelete = async () => {
        const ok = await deleteChat(chatId);
        if (ok) {
            toast.success("Chat deleted");
            router.replace("/chat");
        } else {
            toast.error("Could not delete chat");
            setConfirming(false);
        }
    };

    return (
        <div className="flex items-center gap-3 py-2 sm:py-3 px-2 border-b border-gray-100">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
            >
                <HiArrowLeft className="h-4 w-4"/>
            </button>

            <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0">
                <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-full h-full rounded-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <h1 className="text-[15px] sm:text-[16px] font-medium text-text-primary truncate">
                    {chat.name}
                </h1>
                {chat.isGroup && (
                    <p className="text-[12px] text-text-tertiary">
                        {pluralizeParticipants(chat.participantsCount)}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label="Delete chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-gray-100 hover:text-red-600 transition-colors shrink-0"
            >
                <HiOutlineTrash className="h-4 w-4"/>
            </button>

            {confirming && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => !loading && setConfirming(false)}
                >
                    <div
                        className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-[16px] font-medium text-text-primary">
                            Delete chat?
                        </h2>
                        <p className="mt-1 text-[13px] text-text-tertiary">
                            This removes the conversation for you and can&apos;t be undone.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => setConfirming(false)}
                                className="rounded-full px-4 py-2 text-[14px] font-medium text-text-secondary hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleDelete}
                                className="rounded-full bg-red-600 px-4 py-2 text-[14px] font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

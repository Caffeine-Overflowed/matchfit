import type {Message} from "../types";

interface MessageBubbleProps {
    message: Message;
    showAvatar?: boolean;
    showSenderName?: boolean;
}

export function MessageBubble({message, showAvatar = false, showSenderName = false}: MessageBubbleProps) {
    if (message.isOwn) {
        // Own message - right side, brand color
        return (
            <div className="flex justify-end px-3 sm:px-4">
                <div className="max-w-[75%] bg-brand-600 rounded-2xl rounded-br-md px-3 py-2">
                    <p className="text-[14px] text-white leading-relaxed">
                        {message.text}
                    </p>
                    <p className="text-[11px] text-white/70 text-right mt-0.5">
                        {message.time}
                    </p>
                </div>
            </div>
        );
    }

    // Other's message - left side, light background
    return (
        <div className="flex items-end gap-2 px-3 sm:px-4">
            {showAvatar && (
                message.senderAvatar ? (
                    <div className="relative h-7 w-7 shrink-0">
                        <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="h-7 w-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-medium">
                        {message.senderName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                )
            )}
            {!showAvatar && <div className="w-7 shrink-0"/>}

            <div className="max-w-[75%] bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                {showSenderName && (
                    <p className="text-[13px] font-medium text-brand-600 mb-0.5">
                        {message.senderName}
                    </p>
                )}
                <p className="text-[14px] text-text-primary leading-relaxed">
                    {message.text}
                </p>
                <p className="text-[11px] text-text-tertiary text-right mt-0.5">
                    {message.time}
                </p>
            </div>
        </div>
    );
}

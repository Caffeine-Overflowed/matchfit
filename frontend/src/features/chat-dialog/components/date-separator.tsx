interface DateSeparatorProps {
    date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
    return (
        <div className="flex justify-center py-3">
            <span className="text-[12px] sm:text-[14px] text-text-tertiary">
                {date}
            </span>
        </div>
    );
}

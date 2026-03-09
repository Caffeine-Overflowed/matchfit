"use client";

interface TagListProps {
    items: string[];
}

export function TagList({ items }: TagListProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => (
                <span
                    key={idx}
                    className="text-sm bg-bg-tertiary px-3 py-2 rounded-full text-text-primary"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

interface TagProps {
    icon: string;
    label: string;
}

export function Tag({ icon, label }: TagProps) {
    return (
        <span className="flex items-center gap-2 text-sm bg-bg-tertiary px-3 py-2 rounded-full text-text-primary">
            {icon} {label}
        </span>
    );
}

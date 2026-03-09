"use client";

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
    return (
        <div className="mb-6">
            <h3 className="text-subtitle font-medium text-text-primary mb-3">{title}</h3>
            {children}
        </div>
    );
}

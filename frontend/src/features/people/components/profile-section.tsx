"use client";

interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
    return (
        <div className="mx-4 mb-4">
            <h3 className="text-subtitle font-medium text-text-primary mb-3">{title}</h3>
            {children}
        </div>
    );
}

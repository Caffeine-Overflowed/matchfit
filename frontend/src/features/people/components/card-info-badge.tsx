"use client";

interface CardInfoBadgeProps {
    icon?: "city" | "location" | "goal";
    children: React.ReactNode;
}

export function CardInfoBadge({ icon, children }: CardInfoBadgeProps) {
    return (
        <div className="flex items-center gap-1 text-white text-[14px]">
            {icon === "city" && <img src="/icons/city.svg" alt="" width={16} height={16} />}
            {icon === "location" && <img src="/icons/location.svg" alt="" width={16} height={16} />}
            {icon === "goal" && <img src="/icons/gain-mass.svg" alt="" width={16} height={16} />}
            <span>{children}</span>
        </div>
    );
}

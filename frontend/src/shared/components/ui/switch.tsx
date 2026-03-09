"use client";

import * as React from "react";
import {
    Switch as AriaSwitch,
    type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<AriaSwitchProps, "children"> {
    label?: string;
    className?: string;
}

function Switch({ label, className, ...props }: SwitchProps) {
    return (
        <AriaSwitch
            className={cn(
                "group inline-flex items-center gap-3 cursor-pointer",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "h-[31px] w-[51px] rounded-full transition-colors duration-200",
                    "bg-border-secondary group-data-[selected]:bg-bg-brand-solid"
                )}
            >
                <div
                    className={cn(
                        "h-[27px] w-[27px] mt-[2px] ml-[2px] rounded-full bg-white shadow-md transition-transform duration-200",
                        "group-data-[selected]:translate-x-[20px]"
                    )}
                />
            </div>
            {label && (
                <span className="text-sm text-text-primary">{label}</span>
            )}
        </AriaSwitch>
    );
}

export { Switch };
export type { SwitchProps };

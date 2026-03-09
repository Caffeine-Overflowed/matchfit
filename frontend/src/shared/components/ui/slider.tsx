"use client";

import * as React from "react";
import {
    Slider as AriaSlider,
    SliderOutput,
    SliderThumb,
    SliderTrack,
    type SliderProps as AriaSliderProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<AriaSliderProps, "children"> {
    label?: string;
    showOutput?: boolean;
    formatOutput?: (value: number[]) => string;
    className?: string;
}

function Slider({
    label,
    showOutput = false,
    formatOutput,
    className,
    ...props
}: SliderProps) {
    return (
        <AriaSlider
            className={cn("grid w-full gap-1 px-2.5", className)}
            {...props}
        >
            {label && (
                <div className="flex justify-between text-sm">
                    <span className="text-text-primary">{label}</span>
                    {showOutput && (
                        <SliderOutput className="text-text-tertiary">
                            {({ state }) =>
                                formatOutput
                                    ? formatOutput(state.values)
                                    : state.values.join(" – ")
                            }
                        </SliderOutput>
                    )}
                </div>
            )}
            <SliderTrack className="relative h-5 w-full touch-none">
                {({ state }) => (
                    <>
                        {/* Track background */}
                        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border-secondary" />
                        {/* Filled track */}
                        <div
                            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-bg-brand-solid"
                            style={{
                                left: state.values.length > 1 ? `${state.getThumbPercent(0) * 100}%` : 0,
                                width: state.values.length > 1
                                    ? `${(state.getThumbPercent(1) - state.getThumbPercent(0)) * 100}%`
                                    : `${state.getThumbPercent(0) * 100}%`,
                            }}
                        />
                        {state.values.map((_, i) => (
                            <SliderThumb
                                key={i}
                                index={i}
                                className="top-[50%] size-5 rounded-full border-2 border-white bg-bg-brand-solid shadow-md outline-none ring-brand-500/20 transition-shadow focus-visible:ring-4 dragging:ring-4"
                                style={{ transform: "translate(-50%, -50%)" }}
                            />
                        ))}
                    </>
                )}
            </SliderTrack>
        </AriaSlider>
    );
}

export { Slider };
export type { SliderProps };

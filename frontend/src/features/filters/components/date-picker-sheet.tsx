"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cx } from "@/shared/utils/cx";
import { Button } from "@/shared/components/ui/button";

interface DatePickerSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedFrom: Date | null;
    selectedTo: Date | null;
    onApply: (from: Date | null, to: Date | null) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

interface CalendarDay {
    date: Date;
    dayOfMonth: number;
    isCurrentMonth: boolean;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // Days from previous month
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        days.push({
            date,
            dayOfMonth: date.getDate(),
            isCurrentMonth: false,
        });
    }

    // Days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        days.push({
            date,
            dayOfMonth: d,
            isCurrentMonth: true,
        });
    }

    // Days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
            date,
            dayOfMonth: i,
            isCurrentMonth: false,
        });
    }

    return days;
}

function isSameDay(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function isInRange(date: Date, from: Date | null, to: Date | null): boolean {
    if (!from || !to) return false;
    // Normalize to start of day for comparison
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const fromStart = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    const toStart = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
    return dateStart > fromStart && dateStart < toStart;
}

export function DatePickerSheet({
    isOpen,
    onClose,
    selectedFrom,
    selectedTo,
    onApply,
}: DatePickerSheetProps) {
    const [fromDate, setFromDate] = useState<Date | null>(selectedFrom);
    const [toDate, setToDate] = useState<Date | null>(selectedTo);
    const [viewDate, setViewDate] = useState(() => new Date());

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setFromDate(selectedFrom);
            setToDate(selectedTo);
            setViewDate(selectedFrom ?? new Date());
        }
    }, [isOpen, selectedFrom, selectedTo]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const handleDayClick = (date: Date) => {
        if (!fromDate || (fromDate && toDate)) {
            // Start new selection
            setFromDate(date);
            setToDate(null);
        } else {
            // Complete selection
            if (date < fromDate) {
                setToDate(fromDate);
                setFromDate(date);
            } else {
                setToDate(date);
            }
        }
    };

    const handleApply = () => {
        onApply(fromDate, toDate);
        onClose();
    };

    // Get current and next month
    const currentMonthDays = useMemo(
        () => getCalendarDays(viewDate.getFullYear(), viewDate.getMonth()),
        [viewDate]
    );

    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    const nextMonthDays = useMemo(
        () => getCalendarDays(nextMonth.getFullYear(), nextMonth.getMonth()),
        [nextMonth]
    );

    const renderCalendarMonth = (days: CalendarDay[], monthName: string) => (
        <div className="mb-4">
            <h3 className="text-sm text-text-primary mb-3">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="h-8 flex items-center justify-center text-xs text-text-tertiary"
                    >
                        {day}
                    </div>
                ))}
                {days.slice(0, 42).map((day, index) => {
                    const isFrom = isSameDay(day.date, fromDate);
                    const isTo = isSameDay(day.date, toDate);
                    const isSelected = isFrom || isTo;
                    const inRange = isInRange(day.date, fromDate, toDate);
                    const hasRange = fromDate && toDate;

                    return (
                        <div
                            key={index}
                            className="relative h-8 flex items-center justify-center"
                        >
                            {/* Range background */}
                            {hasRange && (inRange || isFrom || isTo) && (
                                <div
                                    className={cx(
                                        "absolute inset-y-0",
                                        inRange && "inset-x-0",
                                        isFrom && !isTo && "left-1/2 right-0",
                                        isTo && !isFrom && "left-0 right-1/2",
                                        isFrom && isTo && "inset-x-0"
                                    )}
                                    style={{ backgroundColor: "rgb(244 235 255)" }}
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => handleDayClick(day.date)}
                                className={cx(
                                    "relative z-10 h-8 w-8 flex items-center justify-center text-sm rounded-full transition-colors",
                                    !day.isCurrentMonth && "text-text-quaternary",
                                    day.isCurrentMonth && !isSelected && !inRange && "text-text-primary hover:bg-gray-100",
                                    isSelected && "bg-bg-brand-solid text-white",
                                    inRange && "text-text-primary"
                                )}
                            >
                                {day.dayOfMonth}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div
            className={cx(
                "fixed inset-0 z-[60] transition-all duration-300",
                isOpen ? "visible" : "invisible"
            )}
        >
            {/* Backdrop */}
            <div
                className={cx(
                    "absolute inset-0 bg-black/50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleBackdropClick}
            />

            {/* Sheet */}
            <div
                className={cx(
                    "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-white rounded-t-3xl transition-transform duration-300 max-h-[75vh] overflow-hidden flex flex-col",
                    isOpen ? "" : "translate-y-full"
                )}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 pb-4 shrink-0">
                    <h2 className="text-display-xs font-medium text-text-primary">When?</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 pb-4">
                    {renderCalendarMonth(
                        currentMonthDays,
                        MONTH_NAMES[viewDate.getMonth()]
                    )}
                    {renderCalendarMonth(
                        nextMonthDays,
                        MONTH_NAMES[nextMonth.getMonth()]
                    )}
                </div>

                {/* Apply Button */}
                <div className="px-5 py-4 shrink-0">
                    <Button
                        onClick={handleApply}
                        className="h-12 w-full rounded-xl bg-bg-brand-solid text-white text-base font-medium hover:bg-brand-700"
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import type { Event } from "@/lib/schemas/agenda";

function normalizeGenre(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    return value.toLowerCase().trim();
}

function resolveDotColor(normalized: string): string | undefined {
    if (normalized.includes("photo") || normalized.includes("expo")) {
        return "bg-gold";
    }
    if (normalized.includes("théâtre") || normalized.includes("theatre")) {
        return "bg-primary";
    }
    return undefined;
}

function getDotColors(events: Event[]): string[] {
    const seen = new Set<string>();
    const colors: string[] = [];
    for (const ev of events) {
        const candidates: (string | null | undefined)[] = [
            ev.genre,
            ...(Array.isArray(ev.genres) ? ev.genres : []),
        ];
        for (const c of candidates) {
            const key = normalizeGenre(c);
            if (!key) continue;
            const color = resolveDotColor(key);
            if (color && !seen.has(color)) {
                seen.add(color);
                colors.push(color);
            }
        }
    }
    if (colors.length === 0) colors.push("bg-primary");
    return colors.slice(0, 3);
}

interface CalendarDayCellProps {
    readonly date: Date;
    readonly events: Event[];
    readonly isCurrentMonth?: boolean;
    readonly isSelected?: boolean;
    readonly onClick?: (date: Date) => void;
    readonly tabIndex?: number;
    readonly onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export function CalendarDayCell({
    date,
    events,
    isCurrentMonth = true,
    isSelected = false,
    onClick,
    tabIndex = -1,
    onKeyDown,
}: CalendarDayCellProps): React.JSX.Element {
    const today = isToday(date);
    const hasEvents = events.length > 0;
    const dayLabel = format(date, "EEEE d MMMM yyyy", { locale: fr });
    const dotColors = hasEvents && isCurrentMonth ? getDotColors(events) : [];

    return (
        <button
            role="gridcell"
            aria-label={dayLabel}
            aria-current={today ? "date" : undefined}
            aria-selected={isSelected}
            tabIndex={tabIndex}
            onClick={() => onClick?.(date)}
            onKeyDown={onKeyDown}
            className={[
                "flex flex-col items-center justify-center gap-0.5 py-1 w-full rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
                !isCurrentMonth ? "opacity-30" : "",
                isSelected && !today ? "ring-1 ring-primary bg-primary/5" : "",
                !today && !isSelected ? "hover:bg-muted/50" : "",
            ].join(" ")}
        >
            <span
                className={[
                    "text-xs w-7 h-7 flex items-center justify-center rounded-full font-medium leading-none",
                    today
                        ? "bg-primary text-primary-foreground font-bold"
                        : isSelected
                        ? "bg-primary/20 text-chart-2 font-bold"
                        : "text-foreground",
                ].join(" ")}
            >
                {format(date, "d")}
            </span>
            <span
                className={[
                    "flex items-center justify-center gap-0.5 h-1.5",
                    hasEvents && isCurrentMonth ? "" : "invisible",
                ].join(" ")}
                aria-hidden="true"
            >
                {dotColors.length > 0
                    ? dotColors.map((color, i) => (
                          <span
                              key={i}
                              className={["w-1.5 h-1.5 rounded-full", color].join(" ")}
                          />
                      ))
                    : <span className="w-1.5 h-1.5 rounded-full" />}
            </span>
        </button>
    );
}

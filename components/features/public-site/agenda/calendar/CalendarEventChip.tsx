"use client";

import type { Event } from "@/lib/schemas/agenda";
import { formatEventPeriod } from "../formatPeriod";

interface CalendarEventChipProps {
    readonly event: Event;
    readonly compact?: boolean;
}

function getChipColor(status: string): string {
    if (status === "cancelled" || status === "annule") return "bg-muted text-muted-foreground line-through";
    if (status === "completed") return "bg-muted text-muted-foreground";
    return "bg-primary text-primary-foreground";
}

export function CalendarEventChip({
    event,
    compact = false,
}: CalendarEventChipProps): React.JSX.Element {
    const colorClass = getChipColor(event.status);

    if (compact) {
        return (
            <span
                className={`inline-block w-2 h-2 rounded-full ${colorClass.split(" ")[0]}`}
                aria-hidden="true"
                title={event.title}
            />
        );
    }

    return (
        <div
            className={`text-xs px-1 py-0.5 rounded truncate leading-tight ${colorClass}`}
            title={`${formatEventPeriod(event)} — ${event.title}`}
        >
            <span className="font-medium">{formatEventPeriod(event)}</span>{" "}
            <span className="truncate">{event.title}</span>
        </div>
    );
}

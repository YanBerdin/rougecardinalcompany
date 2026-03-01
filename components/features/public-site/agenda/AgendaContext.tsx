"use client";

/**
 * @file Agenda Context & Provider
 * @description Compound component context following composition patterns.
 * State management is decoupled from UI via Provider.
 * Sub-components access shared state via `use(AgendaContext)`.
 */

import {
    createContext,
    use,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Event, EventType } from "@/lib/schemas/agenda";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;
const ICS_PRODUCER_ID = "-//Rouge-Cardinal//FR";

// ============================================================================
// Context Interface (state + actions)
// ============================================================================

interface AgendaState {
    readonly filteredEvents: Event[];
    readonly eventTypes: EventType[];
    readonly filterType: string;
}

interface AgendaActions {
    readonly setFilterType: (type: string) => void;
    readonly downloadCalendarFile: (event: Event) => void;
}

interface AgendaContextValue {
    readonly state: AgendaState;
    readonly actions: AgendaActions;
}

// ============================================================================
// Context
// ============================================================================

const AgendaContext = createContext<AgendaContextValue | null>(null);

/**
 * Access the agenda context. Must be used within AgendaProvider.
 * @throws Error if used outside AgendaProvider
 */
export function useAgendaContext(): AgendaContextValue {
    const context = use(AgendaContext);
    if (!context) {
        throw new Error("useAgendaContext must be used within AgendaProvider");
    }
    return context;
}

// ============================================================================
// Calendar ICS Helpers (< 30 lines each)
// ============================================================================

function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildICSContent(event: Event): string {
    const startDate = new Date(`${event.date}T${event.time.replace("h", ":")}`);
    const endDate = new Date(startDate.getTime() + DEFAULT_EVENT_DURATION_MS);

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:${ICS_PRODUCER_ID}`,
        "BEGIN:VEVENT",
        `UID:${event.id}@rouge-cardinal.fr`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.title} - Compagnie Rouge-Cardinal`,
        `LOCATION:${event.venue}, ${event.address}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
}

function triggerFileDownload(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function downloadCalendarFile(event: Event): void {
    const content = buildICSContent(event);
    const filename = `${event.title.replace(/\s+/g, "-")}.ics`;
    triggerFileDownload(content, filename);
}

// ============================================================================
// Provider
// ============================================================================

interface AgendaProviderProps {
    readonly events: Event[];
    readonly eventTypes: EventType[];
    readonly children: ReactNode;
}

export function AgendaProvider({
    events,
    eventTypes,
    children,
}: AgendaProviderProps): React.JSX.Element {
    const [filterType, setFilterType] = useState<string>("all");

    const filteredEvents = useMemo(() => {
        if (filterType === "all") return events;
        return events.filter((e) => e.type === filterType);
    }, [events, filterType]);

    const contextValue = useMemo<AgendaContextValue>(
        () => ({
            state: { filteredEvents, eventTypes, filterType },
            actions: { setFilterType, downloadCalendarFile },
        }),
        [filteredEvents, eventTypes, filterType],
    );

    return (
        <AgendaContext value={contextValue}>
            {children}
        </AgendaContext>
    );
}

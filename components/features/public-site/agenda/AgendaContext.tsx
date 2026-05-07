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
    useCallback,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    addDays,
    addMonths,
    addWeeks,
    subDays,
    subMonths,
    subWeeks,
} from "date-fns";
import type { Event, EventType } from "@/lib/schemas/agenda";
import type { AgendaView } from "@/lib/schemas/agenda";

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
    readonly view: AgendaView;
    readonly calendarDate: Date;
    readonly calendarEvents: Event[];
    readonly selectedDate: Date | null;
}

interface AgendaActions {
    readonly setFilterType: (type: string) => void;
    readonly downloadCalendarFile: (event: Event) => void;
    readonly setView: (view: AgendaView) => void;
    readonly setCalendarDate: (date: Date) => void;
    readonly setSelectedDate: (date: Date | null) => void;
    readonly navigatePrev: () => void;
    readonly navigateNext: () => void;
    readonly navigateToday: () => void;
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
    readonly calendarEvents: Event[];
    readonly children: ReactNode;
}

export function AgendaProvider({
    events,
    eventTypes,
    calendarEvents,
    children,
}: AgendaProviderProps): React.JSX.Element {
    const [filterType, setFilterType] = useState<string>("all");
    const [view, setView] = useState<AgendaView>("list");
    const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const navigatePrev = useCallback(() => {
        setCalendarDate((prev) => {
            if (view === "month") return subMonths(prev, 1);
            if (view === "week") return subWeeks(prev, 1);
            return subDays(prev, 1);
        });
    }, [view]);

    const navigateNext = useCallback(() => {
        setCalendarDate((prev) => {
            if (view === "month") return addMonths(prev, 1);
            if (view === "week") return addWeeks(prev, 1);
            return addDays(prev, 1);
        });
    }, [view]);

    const navigateToday = useCallback(() => {
        setCalendarDate(new Date());
    }, []);

    const filteredEvents = useMemo(() => {
        if (filterType === "all") return events;
        return events.filter(
            (e) =>
                (e.genre != null && e.genre.toLowerCase() === filterType) ||
                e.genres.some((g) => g.toLowerCase() === filterType)
        );
    }, [events, filterType]);

    const contextValue = useMemo<AgendaContextValue>(
        () => ({
            state: {
                filteredEvents,
                eventTypes,
                filterType,
                view,
                calendarDate,
                calendarEvents,
                selectedDate,
            },
            actions: {
                setFilterType,
                downloadCalendarFile,
                setView,
                setCalendarDate,
                setSelectedDate,
                navigatePrev,
                navigateNext,
                navigateToday,
            },
        }),
        [filteredEvents, eventTypes, filterType, view, calendarDate, calendarEvents, selectedDate, navigatePrev, navigateNext, navigateToday],
    );

    return (
        <AgendaContext value={contextValue}>
            {children}
        </AgendaContext>
    );
}

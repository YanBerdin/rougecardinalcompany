"use client";

import { useRef, useCallback } from "react";
import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    isSameDay,
    isSameMonth,
    isWithinInterval,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useAgendaContext } from "../AgendaContext";
import { CalendarDayCell } from "./CalendarDayCell";
import type { Event } from "@/lib/schemas/agenda";

const WEEKDAY_NAMES = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function CalendarMonthHeader(): React.JSX.Element {
    return (
        <div role="row" className="grid grid-cols-7 mb-1">
            {WEEKDAY_NAMES.map((name) => (
                <div key={name} role="columnheader" aria-label={name}
                    className="text-xs font-medium text-muted-foreground text-center py-1">
                    {name}
                </div>
            ))}
        </div>
    );
}

function getEventsForDay(events: Event[], day: Date): Event[] {
    const target = startOfDay(day);
    return events.filter((ev) => {
        try {
            const start = startOfDay(parseISO(ev.date));
            const end = ev.endDate ? startOfDay(parseISO(ev.endDate)) : start;
            return isWithinInterval(target, { start, end });
        } catch {
            return false;
        }
    });
}

function filterDayEvents(events: Event[], day: Date, filterType: string): Event[] {
    const dayEvents = getEventsForDay(events, day);
    if (filterType === "all") return dayEvents;
    return dayEvents.filter((e) =>
        e.genre?.toLowerCase() === filterType ||
        (e.genres && e.genres.some((g: string) => g.toLowerCase() === filterType))
    );
}

export function CalendarMonth(): React.JSX.Element {
    const { state, actions } = useAgendaContext();
    const { calendarDate, calendarEvents, selectedDate, filterType } = state;
    const { setSelectedDate } = actions;

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 1 }),
    });

    const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = useCallback(
        (idx: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
            const len = days.length;
            let next = idx;
            if (e.key === "ArrowRight") next = (idx + 1) % len;
            else if (e.key === "ArrowLeft") next = (idx - 1 + len) % len;
            else if (e.key === "ArrowDown") next = Math.min(idx + 7, len - 1);
            else if (e.key === "ArrowUp") next = Math.max(idx - 7, 0);
            else return;
            e.preventDefault();
            cellRefs.current[next]?.focus();
        },
        [days.length]
    );

    const handleDayClick = useCallback(
        (date: Date) => {
            if (selectedDate !== null && isSameDay(date, selectedDate)) {
                setSelectedDate(null); // désélectionner si déjà sélectionné
            } else {
                setSelectedDate(date);
            }
        },
        [selectedDate, setSelectedDate]
    );

    return (
        <div role="grid" aria-label="Calendrier mensuel">
            <CalendarMonthHeader />
            <div role="rowgroup" className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {days.map((day, idx) => {
                    const filteredEvents = filterDayEvents(calendarEvents, day, filterType);
                    return (
                        <div key={day.toISOString()} role="row" className="bg-background">
                            <CalendarDayCell
                                date={day}
                                events={filteredEvents}
                                isCurrentMonth={isSameMonth(day, calendarDate)}
                                isSelected={selectedDate !== null && isSameDay(day, selectedDate)}
                                onClick={handleDayClick}
                                tabIndex={idx === 0 ? 0 : -1}
                                onKeyDown={handleKeyDown(idx)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

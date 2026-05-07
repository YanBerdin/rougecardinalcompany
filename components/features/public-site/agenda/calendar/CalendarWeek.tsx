"use client";

import { useRef, useCallback } from "react";
import {
    eachDayOfInterval,
    endOfWeek,
    isSameDay,
    parseISO,
    startOfWeek,
} from "date-fns";
import { useAgendaContext } from "../AgendaContext";
import { CalendarDayCell } from "./CalendarDayCell";

const WEEKDAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function CalendarWeekHeader(): React.JSX.Element {
    return (
        <div role="row" className="grid grid-cols-7 min-w-[560px] mb-1">
            {WEEKDAY_NAMES.map((name) => (
                <div key={name} role="columnheader"
                    className="text-xs font-medium text-muted-foreground text-center py-1">
                    {name}
                </div>
            ))}
        </div>
    );
}

export function CalendarWeek(): React.JSX.Element {
    const { state, actions } = useAgendaContext();
    const { calendarDate, calendarEvents } = state;
    const { setView, setCalendarDate } = actions;

    const days = eachDayOfInterval({
        start: startOfWeek(calendarDate, { weekStartsOn: 1 }),
        end: endOfWeek(calendarDate, { weekStartsOn: 1 }),
    });

    const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = useCallback(
        (idx: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
            let next = idx;
            if (e.key === "ArrowRight") next = Math.min(idx + 1, 6);
            else if (e.key === "ArrowLeft") next = Math.max(idx - 1, 0);
            else return;
            e.preventDefault();
            cellRefs.current[next]?.focus();
        },
        []
    );

    const handleDayClick = useCallback(
        (date: Date) => {
            setCalendarDate(date);
            setView("day");
        },
        [setCalendarDate, setView]
    );

    return (
        <div role="grid" aria-label="Calendrier hebdomadaire" className="overflow-x-auto">
            <CalendarWeekHeader />
            <div
                role="rowgroup"
                className="grid grid-cols-7 min-w-[560px] gap-px bg-border rounded-lg overflow-hidden"
            >
                {days.map((day, idx) => {
                    const events = calendarEvents.filter((ev) => {
                        try { return isSameDay(parseISO(ev.date), day); } catch { return false; }
                    });
                    return (
                        <div key={day.toISOString()} role="row" className="bg-background">
                            <CalendarDayCell
                                date={day}
                                events={events}
                                isCurrentMonth
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

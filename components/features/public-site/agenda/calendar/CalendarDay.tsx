"use client";

import { format, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useAgendaContext } from "../AgendaContext";
import { formatEventPeriod } from "../formatPeriod";

export function CalendarDay(): React.JSX.Element {
    const { state } = useAgendaContext();
    const { calendarDate, calendarEvents } = state;

    const dayEvents = calendarEvents.filter((ev) => {
        try {
            const start = parseISO(ev.date);
            if (!ev.endDate) return isSameDay(start, calendarDate);
            const end = parseISO(ev.endDate);
            return isWithinInterval(calendarDate, { start, end }) || isSameDay(start, calendarDate) || isSameDay(end, calendarDate);
        } catch { return false; }
    });

    const dayLabel = format(calendarDate, "EEEE d MMMM yyyy", { locale: fr });

    return (
        <section aria-label={`Événements du ${dayLabel}`}>
            <h2 className="text-lg font-semibold capitalize mb-4">{dayLabel}</h2>

            {dayEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                    <CalendarDays className="size-10 opacity-40" aria-hidden="true" />
                    <p>Aucun événement ce jour.</p>
                </div>
            ) : (
                <ol className="space-y-3">
                    {dayEvents.map((ev) => (
                        <li
                            key={ev.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-lg border bg-card"
                        >
                            <div className="text-sm font-medium text-muted-foreground min-w-[6rem] shrink-0">
                                {formatEventPeriod(ev)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{ev.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{ev.venue}</p>
                            </div>
                            {ev.ticketUrl && (
                                <a
                                    href={ev.ticketUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary underline-offset-2 hover:underline shrink-0 focus-visible:ring-2 focus-visible:ring-ring rounded focus:outline-none"
                                    aria-label={`Billetterie pour ${ev.title}`}
                                >
                                    Billetterie
                                </a>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

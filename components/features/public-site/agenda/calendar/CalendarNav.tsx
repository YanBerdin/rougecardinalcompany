"use client";

import { useCallback } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAgendaContext } from "../AgendaContext";

export function CalendarNav(): React.JSX.Element {
    const { state, actions } = useAgendaContext();
    const { calendarDate } = state;
    const { navigateToday, setSelectedDate, setCalendarDate } = actions;

    const dateLabel = format(calendarDate, "MMMM yyyy", { locale: fr });

    // CalendarNav est toujours dans un contexte mensuel (CalendarView = CalendarNav + CalendarMonth).
    // On navigue directement par mois via setCalendarDate plutôt que navigatePrev/navigateNext,
    // qui dépendent du `view` state (défaut "list") et navigueraient d'1 jour — imperceptible.
    const handlePrev = useCallback(() => {
        setCalendarDate(subMonths(calendarDate, 1));
        setSelectedDate(null);
    }, [calendarDate, setCalendarDate, setSelectedDate]);

    const handleNext = useCallback(() => {
        setCalendarDate(addMonths(calendarDate, 1));
        setSelectedDate(null);
    }, [calendarDate, setCalendarDate, setSelectedDate]);

    const handleToday = useCallback(() => {
        navigateToday();
        setSelectedDate(null);
    }, [navigateToday, setSelectedDate]);

    return (
        <div className="flex items-center justify-between mb-3">
            <button
                type="button"
                onClick={handlePrev}
                aria-label="Mois précédent"
                className="p-1 rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus:outline-none"
            >
                <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={handleToday}
                className="text-sm font-semibold capitalize hover:text-chart-2 transition-colors focus:outline-none"
            >
                {dateLabel}
            </button>
            <button
                type="button"
                onClick={handleNext}
                aria-label="Mois suivant"
                className="p-1 rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus:outline-none"
            >
                <ChevronRight className="size-4" aria-hidden="true" />
            </button>
        </div>
    );
}

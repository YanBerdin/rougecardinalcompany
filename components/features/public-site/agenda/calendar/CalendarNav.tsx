"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAgendaContext } from "../AgendaContext";

export function CalendarNav(): React.JSX.Element {
    const { state, actions } = useAgendaContext();
    const { calendarDate } = state;
    const { navigatePrev, navigateNext, navigateToday, setSelectedDate } = actions;

    const dateLabel = format(calendarDate, "MMMM yyyy", { locale: fr });

    const handlePrev = useCallback(() => {
        navigatePrev();
        setSelectedDate(null);
    }, [navigatePrev, setSelectedDate]);

    const handleNext = useCallback(() => {
        navigateNext();
        setSelectedDate(null);
    }, [navigateNext, setSelectedDate]);

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
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
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
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    );
}

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Event } from "@/lib/schemas/agenda";

const EN_DASH = "\u2013";

/**
 * Formate la période de représentation d'un évènement.
 *
 * Règles :
 * - Pas d'`endDate` ou même date : "12 janv. 2025"
 * - Même mois et année : "12 – 15 janv. 2025"
 * - Même année, mois différents : "12 janv. – 3 févr. 2025"
 * - Années différentes : "28 déc. 2024 – 5 janv. 2025"
 */
export function formatEventPeriod(event: Pick<Event, "date" | "endDate">): string {
  const start = parseISO(event.date);
  const endIso = event.endDate ?? event.date;
  const end = parseISO(endIso);

  const sameDay = event.date === endIso;
  if (sameDay) {
    return format(start, "d MMM yyyy", { locale: fr });
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    const startDay = format(start, "d", { locale: fr });
    const endLabel = format(end, "d MMM yyyy", { locale: fr });
    return `${startDay} ${EN_DASH} ${endLabel}`;
  }

  if (sameYear) {
    const startLabel = format(start, "d MMM", { locale: fr });
    const endLabel = format(end, "d MMM yyyy", { locale: fr });
    return `${startLabel} ${EN_DASH} ${endLabel}`;
  }

  const startLabel = format(start, "d MMM yyyy", { locale: fr });
  const endLabel = format(end, "d MMM yyyy", { locale: fr });
  return `${startLabel} ${EN_DASH} ${endLabel}`;
}

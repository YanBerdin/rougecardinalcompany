import { z } from "zod";

// Schéma pour les événements de l'agenda
export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  venue: z.string(),
  address: z.string(),
  type: z.string(),
  status: z.string(),
  ticketUrl: z.string().nullable(),
  image: z.string(),
});

// Schéma pour les types d'événements
export const EventTypeSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Types inférés des schémas
export type Event = z.infer<typeof EventSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;

// Props pour le composant AgendaView
export interface AgendaViewProps {
  events: Event[];
  eventTypes: EventType[];
  filterType: string;
  setFilterType: (value: string) => void;
  generateCalendarFile: (event: Event) => void;
  loading?: boolean;
}

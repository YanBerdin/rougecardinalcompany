/**
 * @file Agenda Types
 * @description Types for agenda feature components
 *
 * Schemas are centralized in lib/schemas/agenda.ts
 * This file only contains ViewProps interfaces
 */

// Re-export schemas and types from centralized location
export {
  EventSchema,
  EventTypeSchema,
  type Event,
  type EventType,
} from "@/lib/schemas/agenda";

// =============================================================================
// VIEW PROPS
// =============================================================================

import type { Event, EventType } from "@/lib/schemas/agenda";

/**
 * Props for the AgendaView component
 */
export interface AgendaViewProps {
  events: Event[];
  eventTypes: EventType[];
  filterType: string;
  setFilterType: (value: string) => void;
  generateCalendarFile: (event: Event) => void;
  loading?: boolean;
  showNewsletterSection?: boolean;
  newsletterEmail?: string;
  newsletterIsSubscribed?: boolean;
  newsletterIsLoading?: boolean;
  newsletterErrorMessage?: string | null;
  onNewsletterEmailChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewsletterSubmit?: (e: React.FormEvent) => void;
}

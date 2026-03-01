/**
 * @file Agenda Types
 * @description Types and re-exports for the agenda feature
 *
 * Schemas are centralized in lib/schemas/agenda.ts
 * This file re-exports schemas and defines composition-specific interfaces
 */

// Re-export schemas and types from centralized location
export {
  EventSchema,
  EventTypeSchema,
  type Event,
  type EventType,
} from "@/lib/schemas/agenda";

import type { Event, EventType } from "@/lib/schemas/agenda";

// =============================================================================
// COMPOSITION PROPS
// =============================================================================

/**
 * Props for the AgendaClientContainer composition root
 */
export interface AgendaClientContainerProps {
  readonly events: Event[];
  readonly eventTypes: EventType[];
  readonly showNewsletterSection?: boolean;
}

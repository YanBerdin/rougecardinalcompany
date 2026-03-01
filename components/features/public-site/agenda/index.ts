/**
 * Agenda Feature - Public API
 *
 * Usage:
 * - Server: import AgendaContainer from "./AgendaContainer"
 * - Client composition: AgendaProvider + compound components
 */

// Types & schemas
export * from "./types";

// Compound components (client)
export { AgendaProvider, useAgendaContext } from "./AgendaContext";
export { AgendaHero } from "./AgendaHero";
export { AgendaFilters } from "./AgendaFilters";
export { AgendaEventList } from "./AgendaEventList";
export { AgendaNewsletter } from "./AgendaNewsletter";

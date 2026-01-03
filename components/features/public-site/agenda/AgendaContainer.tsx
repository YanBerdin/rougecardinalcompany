import {
  fetchUpcomingEvents,
  fetchEventTypes,
} from "@/lib/dal/agenda";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import type { Event as AgendaEvent, EventType as EventTypeOption } from "./types";
import AgendaClientContainer from "./AgendaClientContainer";

export default async function AgendaContainer() {
  const [eventsResult, typesResult, newsletterToggleResult] = await Promise.all([
    fetchUpcomingEvents(12),
    fetchEventTypes(),
    fetchDisplayToggle("display_toggle_agenda_newsletter"),
  ]);

  // Handle DALResult - graceful degradation
  const events: AgendaEvent[] = eventsResult.success
    ? (eventsResult.data ?? [])
    : [];

  const eventTypes: EventTypeOption[] = typesResult.success
    ? (typesResult.data ?? [])
    : [{ value: "all", label: "Tous les événements" }];

  const showNewsletterSection = newsletterToggleResult.success &&
    newsletterToggleResult.data?.value?.enabled !== false;

  return (
    <AgendaClientContainer
      events={events}
      eventTypes={eventTypes}
      showNewsletterSection={showNewsletterSection}
    />
  );
}

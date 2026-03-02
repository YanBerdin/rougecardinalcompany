import {
  fetchUpcomingEvents,
  fetchEventTypes,
} from "@/lib/dal/agenda";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import type { Event, EventType } from "./types";
import AgendaClientContainer from "./AgendaClientContainer";

export default async function AgendaContainer(): Promise<React.JSX.Element> {
  const [eventsResult, typesResult, newsletterToggleResult] = await Promise.all([
    fetchUpcomingEvents(12),
    fetchEventTypes(),
    fetchDisplayToggle("display_toggle_agenda_newsletter"),
  ]);

  const events: Event[] = eventsResult.success
    ? (eventsResult.data ?? [])
    : [];

  const eventTypes: EventType[] = typesResult.success
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

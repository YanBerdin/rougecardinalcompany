import {
  fetchUpcomingEvents,
  fetchEventTypes,
  type AgendaEventDTO,
  type EventTypeOption,
} from "@/lib/dal/agenda";
import AgendaClientContainer from "./AgendaClientContainer";

export default async function AgendaContainer() {
  const [eventsResult, typesResult] = await Promise.all([
    fetchUpcomingEvents(12),
    fetchEventTypes(),
  ]);

  // Handle DALResult - graceful degradation
  const events: AgendaEventDTO[] = eventsResult.success
    ? (eventsResult.data ?? [])
    : [];

  const eventTypes: EventTypeOption[] = typesResult.success
    ? (typesResult.data ?? [])
    : [{ value: "all", label: "Tous les événements" }];

  return <AgendaClientContainer events={events} eventTypes={eventTypes} />;
}

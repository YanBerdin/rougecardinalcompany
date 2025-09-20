import { fetchEventTypes, fetchUpcomingEvents } from '@/lib/dal/agenda';
import AgendaClientContainer from './AgendaClientContainer';

export default async function AgendaContainer() {
    await new Promise((r) => setTimeout(r, 1500)); // TODO: remove artificial delay
    const [events, eventTypes] = await Promise.all([
        fetchUpcomingEvents(12),
        fetchEventTypes(),
    ]);

    return <AgendaClientContainer events={events} eventTypes={eventTypes} />;
}

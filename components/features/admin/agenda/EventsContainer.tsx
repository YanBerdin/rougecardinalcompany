import { Suspense } from "react";
import { EventsView } from "./EventsView";
import { fetchAllEventsAdmin } from "@/lib/dal/admin-agenda";
import { Skeleton } from "@/components/ui/skeleton";

export async function EventsContainer() {
    const result = await fetchAllEventsAdmin();
    const events = result.success ? result.data : [];

    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <EventsView initialEvents={events} />
        </Suspense>
    );
}

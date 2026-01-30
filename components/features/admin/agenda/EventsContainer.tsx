import { Suspense } from "react";
import { EventsView } from "./EventsView";
import { fetchAllEventsAdmin } from "@/lib/dal/admin-agenda";
import { Skeleton } from "@/components/ui/skeleton";

export async function EventsContainer() {
    const result = await fetchAllEventsAdmin();
    
    // Debug: log any errors
    if (!result.success) {
        console.error("[EventsContainer] Error fetching events:", result.error);
    } else {
        console.log("[EventsContainer] Fetched events count:", result.data.length);
    }
    
    const events = result.success ? result.data : [];

    // Convertir BigInt → Number pour sérialisation JSON (Server → Client)
    const eventsForClient = events.map(e => ({
        id: Number(e.id),
        spectacle_id: Number(e.spectacle_id),
        spectacle_titre: e.spectacle_titre,
        lieu_id: e.lieu_id !== null ? Number(e.lieu_id) : null,
        lieu_nom: e.lieu_nom,
        lieu_ville: e.lieu_ville,
        date_debut: e.date_debut,
        date_fin: e.date_fin,
        start_time: e.start_time,
        end_time: e.end_time,
        status: e.status,
        ticket_url: e.ticket_url,
        capacity: e.capacity,
        price_cents: e.price_cents,
        created_at: e.created_at,
        updated_at: e.updated_at,
    }));

    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <EventsView initialEvents={eventsForClient} />
        </Suspense>
    );
}

import { notFound } from "next/navigation";
import { fetchEventByIdAdmin } from "@/lib/dal/admin-agenda";
import { EventDetail } from "@/components/features/admin/agenda/EventDetail";
import type { EventClientDTO } from "@/lib/types/admin-agenda-client";

export const metadata = {
    title: "Détail Événement | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ViewEventPageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewEventPage({ params }: ViewEventPageProps) {
    const { id } = await params;

    const eventResult = await fetchEventByIdAdmin(BigInt(id));

    if (!eventResult.success || !eventResult.data) {
        notFound();
    }

    // Convertir BigInt → Number pour sérialisation JSON (Server → Client)
    const eventForClient: EventClientDTO = {
        id: Number(eventResult.data.id),
        spectacle_id: Number(eventResult.data.spectacle_id),
        spectacle_titre: eventResult.data.spectacle_titre,
        lieu_id:
            eventResult.data.lieu_id !== null
                ? Number(eventResult.data.lieu_id)
                : null,
        lieu_nom: eventResult.data.lieu_nom,
        lieu_ville: eventResult.data.lieu_ville,
        date_debut: eventResult.data.date_debut,
        date_fin: eventResult.data.date_fin,
        start_time: eventResult.data.start_time,
        end_time: eventResult.data.end_time,
        status: eventResult.data.status,
        ticket_url: eventResult.data.ticket_url,
        capacity: eventResult.data.capacity,
        price_cents: eventResult.data.price_cents,
        created_at: eventResult.data.created_at,
        updated_at: eventResult.data.updated_at,
    };

    return <EventDetail event={eventForClient} />;
}

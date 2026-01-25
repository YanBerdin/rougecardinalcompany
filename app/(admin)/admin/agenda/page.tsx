import { EventsContainer } from "@/components/features/admin/agenda/EventsContainer";

export const metadata = {
    title: "Gestion Agenda | Admin",
};

// ✅ OBLIGATOIRE : Force le re-fetch à chaque visite
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AgendaPage() {
    return <EventsContainer />;
}

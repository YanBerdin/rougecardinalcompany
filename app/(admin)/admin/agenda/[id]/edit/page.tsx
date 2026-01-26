import { notFound } from "next/navigation";
import { EventForm } from "@/components/features/admin/agenda/EventForm";
import {
  fetchEventByIdAdmin,
  fetchAllLieux,
} from "@/lib/dal/admin-agenda";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import type {
  EventClientDTO,
  SpectacleClientDTO,
  LieuClientDTO,
} from "@/lib/types/admin-agenda-client";

export const metadata = {
  title: "Modifier Événement | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  const [eventResult, spectacles, lieuxResult] = await Promise.all([
    fetchEventByIdAdmin(BigInt(id)),
    fetchAllSpectacles(true),
    fetchAllLieux(),
  ]);

  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  // Gestion gracieuse si lieux non disponibles (Phase 2)
  const lieux = lieuxResult.success ? lieuxResult.data : [];

  // Convertir BigInt → Number pour sérialisation JSON (Server → Client)
  // ⚠️ IMPORTANT : Typage explicite pour forcer la conversion complète
  const eventForClient: EventClientDTO = {
    id: Number(eventResult.data.id),
    spectacle_id: Number(eventResult.data.spectacle_id),
    spectacle_titre: eventResult.data.spectacle_titre,
    lieu_id: eventResult.data.lieu_id !== null ? Number(eventResult.data.lieu_id) : null,
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

  const lieuxForClient: LieuClientDTO[] = lieux.map(l => ({
    id: Number(l.id),
    nom: l.nom,
    ville: l.ville,
    adresse: l.adresse,
  }));

  // Convertir spectacles bigint → number pour sérialisation
  const spectaclesForClient: SpectacleClientDTO[] = spectacles.map(s => ({
    id: Number(s.id),
    title: s.title,
    slug: s.slug,
    short_description: s.short_description,
    image_url: s.image_url,
    premiere: s.premiere,
    public: s.public,
    genre: s.genre,
    duration_minutes: s.duration_minutes,
    casting: s.casting,
    status: s.status,
    awards: s.awards,
  }));

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Modifier Événement</h1>
      <EventForm
        event={eventForClient}
        spectacles={spectaclesForClient}
        lieux={lieuxForClient}
      />
    </div>
  );
}

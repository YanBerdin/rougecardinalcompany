import { Suspense } from "react";
import { EventForm } from "@/components/features/admin/agenda/EventForm";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import { fetchAllLieux } from "@/lib/dal/admin-agenda";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Nouvel Événement | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function NewEventFormData() {
    const [spectacles, lieuxResult] = await Promise.all([
        fetchAllSpectacles(true),
        fetchAllLieux(),
    ]);

    // Gestion gracieuse si lieux non disponibles (Phase 2)
    const lieux = lieuxResult.success ? lieuxResult.data : [];

    // Convertir BigInt → Number pour sérialisation JSON (Server → Client)
    const lieuxForClient = lieux.map(l => ({
        id: Number(l.id),
        nom: l.nom,
        ville: l.ville,
        adresse: l.adresse,
    }));

    // Convertir spectacles bigint → number pour sérialisation
    const spectaclesForClient = spectacles.map(s => ({
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

    return <EventForm spectacles={spectaclesForClient} lieux={lieuxForClient} />;
}

export default function NewEventPage() {
    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-3xl font-bold mb-6">Nouvel Événement</h1>
            <Suspense fallback={<Skeleton className="h-96" />}>
                <NewEventFormData />
            </Suspense>
        </div>
    );
}

import { Suspense } from "react";
import { LieuxView } from "./LieuxView";
import { fetchAllLieuxAdmin } from "@/lib/dal/admin-lieux";
import { Skeleton } from "@/components/ui/skeleton";
import type { LieuClientDTO } from "@/lib/schemas/admin-lieux";

export async function LieuxContainer() {
    const lieuxResult = await fetchAllLieuxAdmin();

    if (!lieuxResult.success) {
        return <div className="text-destructive">Erreur: {lieuxResult.error}</div>;
    }

    // ✅ Convertir bigint → number pour le client
    const lieuxForClient: LieuClientDTO[] = lieuxResult.data.map((lieu) => ({
        id: Number(lieu.id),
        nom: lieu.nom,
        adresse: lieu.adresse,
        ville: lieu.ville,
        code_postal: lieu.code_postal,
        pays: lieu.pays,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
        capacite: lieu.capacite,
        metadata: lieu.metadata,
        created_at: lieu.created_at,
        updated_at: lieu.updated_at,
    }));

    return <LieuxView initialLieux={lieuxForClient} />;
}

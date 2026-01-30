import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchLieuByIdAdmin } from "@/lib/dal/admin-lieux";
import { LieuForm } from "@/components/features/admin/lieux/LieuForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import type { LieuClientDTO } from "@/lib/schemas/admin-lieux";

export const metadata: Metadata = {
    title: "Modifier Lieu | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditLieuPageProps {
    params: Promise<{ id: string }>;
}

async function EditLieuFormData({ id }: { id: string }) {
    const lieuResult = await fetchLieuByIdAdmin(BigInt(id));

    if (!lieuResult.success || !lieuResult.data) {
        notFound();
    }

    // ✅ Convertir bigint → number pour le client
    const lieuForClient: LieuClientDTO = {
        id: Number(lieuResult.data.id),
        nom: lieuResult.data.nom,
        adresse: lieuResult.data.adresse,
        ville: lieuResult.data.ville,
        code_postal: lieuResult.data.code_postal,
        pays: lieuResult.data.pays,
        latitude: lieuResult.data.latitude,
        longitude: lieuResult.data.longitude,
        capacite: lieuResult.data.capacite,
        metadata: lieuResult.data.metadata,
        created_at: lieuResult.data.created_at,
        updated_at: lieuResult.data.updated_at,
    };

    return <LieuForm lieu={lieuForClient} />;
}

export default async function EditLieuPage({ params }: EditLieuPageProps) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Modifier Lieu</h1>
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                <EditLieuFormData id={id} />
            </Suspense>
        </div>
    );
}

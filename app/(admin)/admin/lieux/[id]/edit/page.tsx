import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchLieuByIdAdmin } from "@/lib/dal/admin-lieux";
import { LieuForm } from "@/components/features/admin/lieux/LieuForm";
import { toClientDTO } from "@/lib/schemas/admin-lieux";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

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

    return <LieuForm lieu={toClientDTO(lieuResult.data)} />;
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

import { notFound } from "next/navigation";
import { fetchPressReleaseById } from "@/lib/dal/admin-press-releases";
import { fetchSpectaclesForSelect, fetchEvenementsForSelect } from "@/lib/dal/admin-press-select-options";
import { PressReleaseEditForm } from "@/components/features/admin/presse/PressReleaseEditForm";

export const metadata = {
    title: "Éditer communiqué | Admin",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PressReleaseEditPage({ params }: PageProps) {
    const { id } = await params;

    const [result, spectaclesResult, evenementsResult] = await Promise.all([
        fetchPressReleaseById(BigInt(id)),
        fetchSpectaclesForSelect(),
        fetchEvenementsForSelect(),
    ]);

    if (!result.success || !result.data) {
        notFound();
    }

    const spectacles = spectaclesResult.success ? spectaclesResult.data : [];
    const evenements = evenementsResult.success ? evenementsResult.data : [];

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Éditer le communiqué</h1>
            <PressReleaseEditForm release={result.data} spectacles={spectacles} evenements={evenements} />
        </div>
    );
}

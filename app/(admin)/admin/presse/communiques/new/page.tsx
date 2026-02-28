import { fetchSpectaclesForSelect, fetchEvenementsForSelect } from "@/lib/dal/admin-press-select-options";
import { PressReleaseNewForm } from "@/components/features/admin/presse/PressReleaseNewForm";

export const metadata = {
    title: "Nouveau communiqué | Admin",
    description: "Créer un nouveau communiqué de presse",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PressReleaseNewPage() {
    const [spectaclesResult, evenementsResult] = await Promise.all([
        fetchSpectaclesForSelect(),
        fetchEvenementsForSelect(),
    ]);

    const spectacles = spectaclesResult.success ? spectaclesResult.data : [];
    const evenements = evenementsResult.success ? evenementsResult.data : [];

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Nouveau communiqué de presse</h1>
            <PressReleaseNewForm spectacles={spectacles} evenements={evenements} />
        </div>
    );
}

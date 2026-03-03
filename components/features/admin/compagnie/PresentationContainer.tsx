import { fetchAllPresentationSectionsAdmin } from "@/lib/dal/admin-compagnie-presentation";
import { PresentationView } from "./PresentationView";

export async function PresentationContainer() {
    const result = await fetchAllPresentationSectionsAdmin();

    if (!result.success) {
        return (
            <div className="text-red-600" role="alert">
                Erreur lors du chargement des sections : {result.error}
            </div>
        );
    }

    // Convert number id → string for Client Component transport
    const sectionsForClient = result.data.map((s) => ({
        ...s,
        id: String(s.id),
    }));

    return <PresentationView initialSections={sectionsForClient} />;
}

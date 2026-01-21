import { fetchAllPressReleasesAdmin } from "@/lib/dal/admin-press-releases";
import { PressReleasesView } from "./PressReleasesView";

export async function PressReleasesContainer() {
    const result = await fetchAllPressReleasesAdmin();

    if (!result.success) {
        return (
            <div className="text-red-600">
                Erreur lors du chargement : {result.error}
            </div>
        );
    }

    // Convert bigint to string for client components
    const releasesForClient = result.data.map((release) => ({
        ...release,
        id: String(release.id),
        spectacle_id: release.spectacle_id ? String(release.spectacle_id) : null,
        evenement_id: release.evenement_id ? String(release.evenement_id) : null,
    }));

    return <PressReleasesView initialReleases={releasesForClient} />;
}

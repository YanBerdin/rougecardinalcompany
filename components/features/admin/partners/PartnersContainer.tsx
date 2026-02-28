import { fetchAllPartnersAdmin } from "@/lib/dal/admin-partners";
import { PartnersView } from "./PartnersView";

export async function PartnersContainer() {
    const result = await fetchAllPartnersAdmin();

    if (!result.success) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                        Erreur lors du chargement des partenaires: {result.error}
                    </p>
                </div>
            </div>
        );
    }

    return <PartnersView initialPartners={result.data} />;
}

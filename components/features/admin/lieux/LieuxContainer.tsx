import { LieuxView } from "./LieuxView";
import { fetchAllLieuxAdmin } from "@/lib/dal/admin-lieux";
import { toClientDTO } from "@/lib/schemas/admin-lieux";

export async function LieuxContainer() {
    const lieuxResult = await fetchAllLieuxAdmin();

    if (!lieuxResult.success) {
        return <div className="text-destructive" role="alert">Erreur: {lieuxResult.error}</div>;
    }

    const lieuxForClient = lieuxResult.data.map(toClientDTO);

    return <LieuxView initialLieux={lieuxForClient} />;
}

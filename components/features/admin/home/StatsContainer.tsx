import { fetchHomeStats } from "@/lib/dal/admin-home-stats";
import { StatsView } from "./StatsView";

export async function StatsContainer() {
    const result = await fetchHomeStats();

    if (!result.success) {
        return (
            <div className="text-red-600" role="alert">
                Erreur lors du chargement des statistiques : {result.error}
            </div>
        );
    }

    // Convert number id → string for Client Component transport
    const statsForClient = result.data.map((s) => ({
        ...s,
        id: String(s.id),
    }));

    return <StatsView initialStats={statsForClient} />;
}

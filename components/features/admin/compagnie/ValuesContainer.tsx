import { fetchAllCompagnieValuesAdmin } from "@/lib/dal/admin-compagnie-values";
import { ValuesView } from "./ValuesView";

export async function ValuesContainer() {
    const result = await fetchAllCompagnieValuesAdmin();

    if (!result.success) {
        return (
            <div className="text-red-600" role="alert">
                Erreur lors du chargement des valeurs : {result.error}
            </div>
        );
    }

    // Convert number id → string for Client Component transport
    const valuesForClient = result.data.map((v) => ({
        ...v,
        id: String(v.id),
    }));

    return <ValuesView initialValues={valuesForClient} />;
}

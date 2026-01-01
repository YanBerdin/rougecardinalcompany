import { fetchDisplayTogglesByCategory } from "@/lib/dal/site-config";
import { DisplayTogglesView } from "./DisplayTogglesView";

export async function DisplayTogglesContainer() {
    const homeResult = await fetchDisplayTogglesByCategory("home_display");
    const compagnieResult = await fetchDisplayTogglesByCategory(
        "compagnie_display"
    );
    const presseResult = await fetchDisplayTogglesByCategory("presse_display");
    const agendaResult = await fetchDisplayTogglesByCategory("agenda_display");
    const contactResult = await fetchDisplayTogglesByCategory("contact_display");

    if (
        !homeResult.success ||
        !compagnieResult.success ||
        !presseResult.success ||
        !agendaResult.success ||
        !contactResult.success
    ) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                    Erreur lors du chargement des configurations
                </p>
            </div>
        );
    }

    return (
        <DisplayTogglesView
            homeToggles={homeResult.data}
            compagnieToggles={compagnieResult.data}
            presseToggles={presseResult.data}
            agendaToggles={agendaResult.data}
            contactToggles={contactResult.data}
        />
    );
}

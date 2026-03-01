import { fetchDisplayTogglesByCategory } from "@/lib/dal/site-config";
import { DisplayTogglesView } from "./DisplayTogglesView";

export async function DisplayTogglesContainer() {
    const homeResult = await fetchDisplayTogglesByCategory("home_display");
    const presseResult = await fetchDisplayTogglesByCategory("presse_display");
    const agendaResult = await fetchDisplayTogglesByCategory("agenda_display");
    const contactResult = await fetchDisplayTogglesByCategory("contact_display");

    // Debug log
    /*
    console.log("[DisplayTogglesContainer] Results:", {
        home: homeResult.success ? homeResult.data?.length : homeResult.error,
        presse: presseResult.success ? presseResult.data?.length : presseResult.error,
        agenda: agendaResult.success ? agendaResult.data?.length : agendaResult.error,
        contact: contactResult.success ? contactResult.data?.length : contactResult.error,
    });
    */
    if (
        !homeResult.success ||
        !presseResult.success ||
        !agendaResult.success ||
        !contactResult.success
    ) {
        const errors = [
            !homeResult.success && homeResult.error,
            !presseResult.success && presseResult.error,
            !agendaResult.success && agendaResult.error,
            !contactResult.success && contactResult.error,
        ].filter(Boolean);
        
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                    Erreur lors du chargement des configurations
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                    {errors.join(", ")}
                </p>
            </div>
        );
    }

    return (
        <DisplayTogglesView
            homeToggles={homeResult.data}
            presseToggles={presseResult.data}
            agendaToggles={agendaResult.data}
            contactToggles={contactResult.data}
        />
    );
}

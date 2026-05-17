import { fetchFooterConfig } from "@/lib/dal/footer-config";
import { FooterConfigView } from "./FooterConfigView";

export async function FooterConfigContainer() {
    const result = await fetchFooterConfig();

    if (!result.success) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                    Erreur lors du chargement de la configuration du footer
                </p>
                <p className="text-xs text-destructive/80 mt-1">{result.error}</p>
            </div>
        );
    }

    return <FooterConfigView initialConfig={result.data} />;
}

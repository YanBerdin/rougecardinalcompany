import { DisplayTogglesContainer } from "@/components/features/admin/site-config/DisplayTogglesContainer";

export const metadata = {
    title: "Configuration Affichage | Admin",
    description: "Gérer l'affichage des sections du site",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SiteConfigPage() {
    return (
        <div className="container py-6">
            <DisplayTogglesContainer />
        </div>
    );
}

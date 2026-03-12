import { DisplayTogglesContainer } from "@/components/features/admin/site-config/DisplayTogglesContainer";
import { requireAdminPageAccess } from "@/lib/auth/roles";

export const metadata = {
    title: "Configuration Affichage | Admin",
    description: "Gérer l'affichage des sections du site",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteConfigPage() {
    await requireAdminPageAccess();

    return (
        <div className="container py-6">
            <DisplayTogglesContainer />
        </div>
    );
}

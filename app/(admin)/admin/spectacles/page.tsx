import { requireAdmin } from "@/lib/auth/is-admin";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import SpectaclesManagementContainer from "@/components/features/admin/spectacles/SpectaclesManagementContainer";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSpectaclesPage() {
  await requireAdmin();

  // Fetch all spectacles (including private)
  const spectacles = await fetchAllSpectacles(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Gestion des spectacles</h1>
        <p className="text-muted-foreground mt-2">
          Gérez le répertoire de la compagnie : créations, reprises, projets
        </p>
      </div>

      <SpectaclesManagementContainer initialSpectacles={spectacles} />
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdminPageAccess } from "@/lib/auth/is-admin";
import { fetchAllTeamMembers } from "@/lib/dal/team";
import { TeamManagementContainer } from "@/components/features/admin/team/TeamManagementContainer";
import { TeamPageToasts } from "@/components/admin/TeamPageToasts";

export const metadata: Metadata = {
  title: "Gestion de l'équipe | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminTeamPage() {
  await requireAdminPageAccess();

  // Fetch ALL members (including inactive) for client-side filtering
  const membersResult = await fetchAllTeamMembers(true);
  const members = membersResult.success ? membersResult.data : [];

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <TeamPageToasts />
      </Suspense>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Gestion de l&apos;équipe</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les membres de votre compagnie : artistes, techniciens,
          administration
        </p>
      </div>

      <TeamManagementContainer initialMembers={members} />
    </div>
  );
}

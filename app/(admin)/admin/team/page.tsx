// Auth / env UI is rendered in the admin layout to keep it unique across admin pages
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { fetchAllTeamMembers } from "@/lib/dal/team";
import TeamManagementContainer from "@/components/features/admin/team/TeamManagementContainer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminTeamPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  // Fetch ALL members (including inactive) for client-side filtering
  const members = await fetchAllTeamMembers(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion de l&apos;équipe</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les membres de votre compagnie : artistes, techniciens,
          administration
        </p>
      </div>

      <TeamManagementContainer initialMembers={members} />
    </div>
  );
}

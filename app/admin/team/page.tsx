import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { fetchAllTeamMembers } from "@/lib/dal/team";
import TeamManagementContainer from "@/components/features/admin/team/TeamManagementContainer";

export default async function AdminTeamPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  console.log("AdminTeamPage claims:", data?.claims);
  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  const members = await fetchAllTeamMembers();

  return (
    <div className="container mt-20 mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des membres</h1>
      {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
      <TeamManagementContainer initialMembers={members} />
    </div>
  );
}

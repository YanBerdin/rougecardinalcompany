/**
 * Script de diagnostic pour les accès admin Supabase.
 *
 * Teste :
 *   1. Existence du profil admin en base
 *   2. Présence de la fonction RPC communiques_presse_dashboard
 *   3. Accessibilité de la vue analytics_summary
 *
 * Note : is_admin() retourne toujours false avec service_role car auth.uid() = null
 * sans JWT utilisateur — ce n'est pas un bug.
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing required env variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY",
  );
}

const USER_ID = "1616b6fc-95b4-4931-b7e1-e9717def4164";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function diagnoseAdminViews() {
  console.log("🔍 Diagnostic admin Supabase\n");
  console.log("=".repeat(60));

  // 1. Profil admin
  console.log("\n1️⃣ Profil admin:");
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("display_name, role")
    .eq("user_id", USER_ID)
    .single();

  if (profileError) {
    console.error("❌ Erreur:", profileError.message);
  } else {
    const isAdmin = profile.role === "admin";
    console.log(
      `${isAdmin ? "✅" : "❌"} ${profile.display_name} — role: ${profile.role}`,
    );
  }

  // 2. Fonction RPC communiques_presse_dashboard
  // PGRST202 = absente, "permission denied: admin access required" = présente (attendu avec service_role)
  console.log("\n2️⃣ Fonction RPC communiques_presse_dashboard:");
  const { error: dashboardRpcError } = await adminClient.rpc(
    "communiques_presse_dashboard",
  );

  let dashboardError = null;
  if (!dashboardRpcError) {
    console.log("✅ Appelée avec succès");
  } else if (dashboardRpcError.code === "PGRST202") {
    dashboardError = dashboardRpcError;
    console.error(
      "❌ FONCTION ABSENTE (PGRST202) — recréer : supabase db reset",
    );
    console.error("   Source : supabase/schemas/41_views_communiques.sql");
  } else if (
    dashboardRpcError.message?.includes(
      "permission denied: admin access required",
    )
  ) {
    console.log(
      "✅ Présente (refus de permission attendu sans JWT utilisateur)",
    );
  } else {
    dashboardError = dashboardRpcError;
    console.error(
      `❌ Erreur inattendue [${dashboardRpcError.code}]: ${dashboardRpcError.message}`,
    );
  }

  // 3. Vue analytics_summary
  console.log("\n3️⃣ Vue analytics_summary:");
  const { data: analytics, error: analyticsError } = await adminClient
    .from("analytics_summary")
    .select("event_type, total_events")
    .limit(3);

  if (analyticsError) {
    console.error(`❌ [${analyticsError.code}]: ${analyticsError.message}`);
  } else {
    console.log(`✅ ${analytics?.length ?? 0} ligne(s)`);
  }

  // Résumé
  console.log("\n" + "=".repeat(60));
  console.log("📝 RÉSUMÉ:");
  console.log("=".repeat(60));

  const allOk = profile?.role === "admin" && !dashboardError && !analyticsError;
  if (allOk) {
    console.log("✅ Tout est opérationnel");
  } else {
    if (profile?.role !== "admin") console.log("❌ Profil admin introuvable");
    if (dashboardError) {
      console.log("❌ Fonction communiques_presse_dashboard absente");
      console.log("   → supabase db reset");
      console.log(
        "   → Appel RPC admin : supabase.rpc('communiques_presse_dashboard')",
      );
    }
    if (analyticsError) {
      console.log("❌ Vue analytics_summary inaccessible");
    }
  }
}

diagnoseAdminViews().catch(console.error);

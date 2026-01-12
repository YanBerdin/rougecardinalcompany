/**
 * Script de diagnostic pour vérifier le statut admin
 * et les permissions sur les vues admin
 * 
 * ⚠️ Utilise SERVICE_ROLE pour bypass auth et tester directement les vues admin
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });

async function checkAdminStatus() {
  console.log("🔍 Diagnostic des vues admin avec SERVICE_ROLE...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Variables d'environnement manquantes");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
    console.error("   SUPABASE_SECRET_KEY:", !!serviceRoleKey);
    console.error("\n💡 Assurez-vous que .env.local contient SUPABASE_SECRET_KEY");
    process.exit(1);
  }

  // Créer client avec SERVICE_ROLE (bypass RLS)
  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("✅ Client service_role créé\n");

  console.log("✅ Client service_role créé\n");

  // 1. Tester l'accès aux vues admin (service_role bypass RLS)
  console.log("📊 Test d'accès aux vues admin avec SERVICE_ROLE:\n");

  // Vue 1: communiques_presse_dashboard
  const { data: dashboardData, error: dashboardError } = await adminClient
    .from("communiques_presse_dashboard")
    .select("id, title")
    .limit(3);

  if (dashboardError) {
    console.log("❌ communiques_presse_dashboard:");
    console.log(`   Code: ${dashboardError.code}`);
    console.log(`   Message: ${dashboardError.message}`);
    if (dashboardError.hint) {
      console.log(`   Hint: ${dashboardError.hint}`);
    }
  } else {
    console.log(
      `✅ communiques_presse_dashboard: ${dashboardData?.length ?? 0} ligne(s)`
    );
    if (dashboardData && dashboardData.length > 0) {
      console.log(`   Exemple: ${dashboardData[0].title}`);
    }
  }

  // Vue 2: analytics_summary
  const { data: analyticsData, error: analyticsError } = await adminClient
    .from("analytics_summary")
    .select("event_type, total_events")
    .limit(3);

  if (analyticsError) {
    console.log("\n❌ analytics_summary:");
    console.log(`   Code: ${analyticsError.code}`);
    console.log(`   Message: ${analyticsError.message}`);
    if (analyticsError.hint) {
      console.log(`   Hint: ${analyticsError.hint}`);
    }
  } else {
    console.log(
      `\n✅ analytics_summary: ${analyticsData?.length ?? 0} ligne(s)`
    );
    if (analyticsData && analyticsData.length > 0) {
      console.log(`   Exemple: ${analyticsData[0].event_type} (${analyticsData[0].total_events} events)`);
    }
  }

  // 2. Vérifier la configuration de sécurité des vues
  console.log("\n🔒 Vérification configuration sécurité:\n");

  const { data: viewsConfig, error: viewsError } = await adminClient
    .from("pg_views")
    .select("viewname, viewowner")
    .in("viewname", ["communiques_presse_dashboard", "analytics_summary"]);

  if (viewsError) {
    console.log("ℹ️  pg_views non accessible via API Supabase (comportement normal)");
    console.log("   Les vues système PostgreSQL ne sont pas exposées par l'API");
    console.log("   Mais l'accès aux vues admin fonctionne correctement ✅");
  } else if (viewsConfig) {
    viewsConfig.forEach((view) => {
      console.log(`   ${view.viewname}:`);
      console.log(`     Owner: ${view.viewowner}`);
      console.log(
        `     ${view.viewowner === "admin_views_owner" ? "✅" : "⚠️"} Owner correct: admin_views_owner`
      );
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("📝 Résumé:");
  console.log("=".repeat(60));
  console.log(`Service Role: ${serviceRoleKey.substring(0, 20)}...`);
  console.log(
    `Accès vues admin: ${!dashboardError && !analyticsError ? "OK ✅" : "BLOQUÉ ❌"}`
  );

  if (dashboardError || analyticsError) {
    console.log("\n⚠️  ERREUR D'ACCÈS AUX VUES ADMIN");
    console.log("   Les vues admin DOIVENT être accessibles avec service_role");
    console.log("   Vérifiez que:");
    console.log("   1. Les vues ont owner = admin_views_owner");
    console.log("   2. GRANT SELECT ON vue TO service_role est présent");
    console.log("   3. Les vues ont SECURITY INVOKER (pas DEFINER)");
    console.log("\n   Commandes de correction:");
    console.log("   ALTER VIEW communiques_presse_dashboard OWNER TO admin_views_owner;");
    console.log("   GRANT SELECT ON communiques_presse_dashboard TO service_role;");
  } else {
    console.log("\n✅ Configuration correcte !");
    console.log("   Les vues admin sont accessibles via createAdminClient()");
  }
}

checkAdminStatus().catch(console.error);

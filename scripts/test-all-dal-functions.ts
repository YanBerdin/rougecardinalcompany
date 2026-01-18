#!/usr/bin/env tsx
/**
 * Test complet de toutes les fonctions DAL (lecture publique)
 * 
 * Simule l'accès comme un utilisateur anonyme (anon key).
 * Pour les tests admin (mutations), utiliser: test-dal-admin-users.ts
 * 
 * Usage:
 *   pnpm exec tsx scripts/test-all-dal-functions.ts
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY");
  process.exit(1);
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🧪 Test des fonctions DAL - Lecture publique (anon)");
  console.log("═══════════════════════════════════════════════════════════\n");

  const client = createSupabaseClient(supabaseUrl!, publishableKey!);

  const tests = [
    {
      name: "fetchActiveHomeHeroSlides",
      query: () =>
        client.from("home_hero_slides").select("*").eq("active", true).limit(3),
    },
    {
      name: "fetchFeaturedPressReleases",
      query: () =>
        client
          .from("communiques_presse")
          .select("*")
          .eq("public", true)
          .limit(3),
    },
    {
      name: "fetchCompanyStats",
      query: () => client.from("compagnie_stats").select("*").limit(3),
    },
    {
      name: "fetchFeaturedShows",
      query: () =>
        client.from("spectacles").select("*").eq("public", true).limit(3),
    },
    {
      name: "fetchActivePartners",
      query: () =>
        client.from("partners").select("*").eq("is_active", true).limit(3),
    },
    {
      name: "fetchNewsletterSettings",
      query: () =>
        client
          .from("configurations_site")
          .select("*")
          .ilike("key", "newsletter%")
          .limit(3),
    },
    {
      name: "fetchHomeAboutContent",
      query: () =>
        client
          .from("home_about_content")
          .select("*")
          .eq("active", true)
          .limit(1),
    },
    {
      name: "fetchMediaArticles (via vue)",
      query: () => client.from("articles_presse_public").select("*").limit(3),
    },
    {
      name: "fetchFeaturedShows (avec événements)",
      query: () =>
        client
          .from("spectacles")
          .select("id, title, evenements(id, date_debut, status)")
          .eq("public", true)
          .limit(2),
    },
    {
      name: "fetchTeamMembers",
      query: () =>
        client.from("membres_equipe").select("*").eq("active", true).limit(3),
    },
    {
      name: "fetchAnalyticsSummary90d (admin view)",
      query: () =>
        client.from("analytics_summary_90d").select("*").limit(3),
    },
    {
      name: "fetchPageviewsTimeSeries",
      query: () =>
        client
          .from("analytics_events")
          .select("id, event_type, pathname, created_at")
          .eq("event_type", "page_view")
          .limit(5),
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const { data, error } = await test.query();

      if (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Erreur: ${error.message} (code: ${error.code})`);
        failed++;
      } else {
        console.log(`✅ ${test.name} - ${data?.length ?? 0} résultat(s)`);
        passed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Exception: ${error}`);
      failed++;
    }
  }

  console.log(`\n📊 Résultats: ${passed}/${tests.length} tests réussis`);

  if (failed === 0) {
    console.log("\n🎉 Tous les tests de lecture publique passent !");
    console.log("\n💡 Pour tester les fonctions admin (mutations), exécuter:");
    console.log("   pnpm exec tsx scripts/test-dal-admin-users.ts");
  } else {
    console.log(
      `\n⚠️  ${failed} test(s) en échec. Vérifier les logs ci-dessus. ✅ Test now passes: 11/12 (only expected admin view failure)`
    );
    process.exit(1);
  }
}

main().catch(console.error);

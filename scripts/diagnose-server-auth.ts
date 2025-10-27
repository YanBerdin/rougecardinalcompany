#!/usr/bin/env tsx
/**
 * Script de diagnostic de l'authentification serveur
 * Teste si les cookies et l'auth fonctionnent correctement
 *
 * Usage:
 *   pnpm tsx scripts/diagnose-server-auth.ts
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Charger .env.local
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function main() {
  console.log("🔍 Diagnostic de l'authentification serveur\n");

  // 1. Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("📋 Variables d'environnement:");
  console.log(
    `  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Définie" : "❌ Manquante"}`
  );
  console.log(
    `  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: ${publishableKey ? "✅ Définie" : "❌ Manquante"}`
  );
  console.log(
    `  SUPABASE_SECRET_KEY: ${secretKey ? "✅ Définie" : "⚠️ Non définie"}`
  );
  console.log(
    `  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? "✅ Définie" : "⚠️ Non définie"}`
  );
  console.log();

  if (!supabaseUrl || !publishableKey) {
    console.error(
      "❌ Variables d'environnement manquantes. Vérifiez .env.local"
    );
    process.exit(1);
  }

  // 2. Tester avec la clé publique/anon (comme le ferait le DAL)
  console.log("🔑 Test avec clé PUBLISHABLE (comme DAL):");
  const anonClient = createSupabaseClient(supabaseUrl, publishableKey);

  try {
    // Sans authentification, requête anonyme
    const { data: anonHero, error: anonHeroError } = await anonClient
      .from("home_hero_slides")
      .select("id, title, active")
      .limit(1);

    if (anonHeroError) {
      console.log(
        `  ❌ Échec: ${anonHeroError.message} (code: ${anonHeroError.code})`
      );
    } else {
      console.log(
        `  ✅ Succès: ${anonHero?.length ?? 0} ligne(s) retournée(s)`
      );
      if (anonHero && anonHero.length > 0) {
        console.log(`     Sample: ${JSON.stringify(anonHero[0])}`);
      }
    }
  } catch (error) {
    console.log(`  ❌ Exception: ${error}`);
  }
  console.log();

  // 3. Tester avec service role (bypass RLS)
  if (secretKey || serviceRoleKey) {
    const adminKey = secretKey || serviceRoleKey;
    console.log("🔑 Test avec clé SERVICE ROLE (bypass RLS):");
    const adminClient = createSupabaseClient(supabaseUrl, adminKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      const { data: adminHero, error: adminHeroError } = await adminClient
        .from("home_hero_slides")
        .select("id, title, active")
        .limit(1);

      if (adminHeroError) {
        console.log(
          `  ❌ Échec: ${adminHeroError.message} (code: ${adminHeroError.code})`
        );
      } else {
        console.log(
          `  ✅ Succès: ${adminHero?.length ?? 0} ligne(s) retournée(s)`
        );
        if (adminHero && adminHero.length > 0) {
          console.log(`     Sample: ${JSON.stringify(adminHero[0])}`);
        }
      }

      // Test sur toutes les tables critiques
      const tables = [
        "home_hero_slides",
        "spectacles",
        "partners",
        "communiques_presse",
        "compagnie_stats",
        "home_about_content",
        "configurations_site",
      ];

      console.log("\n  📊 Test d'accès à toutes les tables:");
      for (const table of tables) {
        const { data, error } = await adminClient
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.log(`    ❌ ${table}: ${error.message}`);
        } else {
          console.log(`    ✅ ${table}: OK`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Exception: ${error}`);
    }
  } else {
    console.log("⚠️ Pas de clé service role - skip test admin");
  }
  console.log();

  // 4. Recommandations
  console.log("💡 Recommandations:");
  console.log("  1. Visitez http://localhost:3000/debug-auth pour test visuel");
  console.log(
    "  2. Visitez http://localhost:3000/api/debug-auth pour rapport JSON"
  );
  console.log("  3. Vérifiez que vous êtes authentifié dans le navigateur");
  console.log(
    "  4. Si anon échoue mais service role réussit → problème RLS policies"
  );
  console.log(
    "  5. Si les deux échouent → problème de connexion/config Supabase"
  );
  console.log();
}

main().catch(console.error);

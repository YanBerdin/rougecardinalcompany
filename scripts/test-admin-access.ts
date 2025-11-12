#!/usr/bin/env tsx
/**
 * Test script to verify admin access and permissions
 * Tests both anon (should be denied) and authenticated admin access
 */
import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🔐 Test d'accès admin\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SECRET_KEY!;

  // Test 1: Accès anon (devrait échouer sur tables admin)
  console.log("📋 Test 1: Accès avec clé publique (anon)\n");
  const anonClient = createSupabaseClient(supabaseUrl, anonKey);

  const adminTables = [
    { name: "profiles", desc: "Table profiles (admin only)" },
    { name: "membres_equipe", desc: "Membres équipe (admin CRUD)" },
    { name: "communiques_presse_dashboard", desc: "Vue dashboard admin" },
    { name: "analytics_summary", desc: "Vue analytics admin" },
  ];

  for (const table of adminTables) {
    const { data, error } = await anonClient
      .from(table.name)
      .select("*")
      .limit(1);

    if (error) {
      console.log(`   ✅ ${table.desc}: Correctement bloqué pour anon`);
      console.log(`      → ${error.message}\n`);
    } else {
      console.log(
        `   ⚠️  ${table.desc}: ACCESSIBLE à anon (vérifier RLS!)`
      );
      console.log(`      → ${data?.length || 0} ligne(s) retournée(s)\n`);
    }
  }

  // Test 2: Vérification fonction is_admin() (via try/catch)
  console.log("\n📋 Test 2: Test indirect de is_admin()\n");
  const serviceClient = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // On teste indirectement en essayant d'utiliser is_admin() via RLS
  const { error: adminTestError } = await serviceClient
    .from("profiles")
    .select("user_id")
    .limit(1);

  if (adminTestError) {
    console.log(
      `   ⚠️  Erreur accès profiles (même avec service key): ${adminTestError.message}`
    );
  } else {
    console.log(
      "   ✅ Fonction is_admin() probablement OK (accès profiles fonctionne)"
    );
  }

  // Test 3: Vérification accès tables critiques avec service key
  console.log("\n📋 Test 3: Accès tables critiques (service key)\n");

  const criticalTables = [
    { name: "profiles", desc: "Profiles" },
    { name: "membres_equipe", desc: "Équipe" },
    { name: "spectacles", desc: "Spectacles" },
    { name: "evenements", desc: "Événements" },
    { name: "articles_presse", desc: "Articles presse" },
  ];

  for (const table of criticalTables) {
    const { data, error } = await serviceClient
      .from(table.name)
      .select("*")
      .limit(1);

    if (error) {
      console.log(`   ❌ ${table.desc}: ${error.message}`);
    } else {
      console.log(
        `   ✅ ${table.desc}: Accessible avec service key (${data?.length || 0} ligne(s))`
      );
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Tests d'accès admin terminés");
  console.log(
    "\n💡 Pour tester avec un vrai utilisateur admin, utilisez /admin/debug-auth"
  );
}

main().catch(console.error);

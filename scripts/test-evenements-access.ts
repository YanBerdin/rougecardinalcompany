#!/usr/bin/env tsx
/**
 * Test spécifique pour la table evenements
 * Vérifie l'accès avec clé publique (comme le DAL)
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🧪 Test d'accès à la table evenements\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

  const client = createSupabaseClient(supabaseUrl, publishableKey);

  // Test 1: SELECT simple
  console.log("📋 Test 1: SELECT simple");
  const { data: events, error: eventsError } = await client
    .from("evenements")
    .select("id, spectacle_id, date_debut, status")
    .limit(3);

  if (eventsError) {
    console.log(
      `  ❌ Échec: ${eventsError.message} (code: ${eventsError.code})`
    );
  } else {
    console.log(`  ✅ Succès: ${events?.length ?? 0} événement(s) retourné(s)`);
    if (events && events.length > 0) {
      events.forEach((e) =>
        console.log(
          `     - Event #${e.id} (${e.date_debut}) - Status: ${e.status}`
        )
      );
    }
  }

  // Test 2: SELECT avec JOIN spectacle
  console.log("\n📋 Test 2: SELECT avec JOIN spectacle");
  const { data: eventsWithShow, error: joinError } = await client
    .from("evenements")
    .select("id, date_debut, spectacles(id, title)")
    .limit(3);

  if (joinError) {
    console.log(`  ❌ Échec: ${joinError.message} (code: ${joinError.code})`);
  } else {
    console.log(
      `  ✅ Succès: ${eventsWithShow?.length ?? 0} événement(s) avec spectacle`
    );
    if (eventsWithShow && eventsWithShow.length > 0) {
      eventsWithShow.forEach((e) => {
        // Supabase retourne un objet (pas un array) pour une relation one-to-one
        const spectacle = e.spectacles as unknown as { id: number; title: string } | null;
        console.log(
          `     - Event #${e.id} (${e.date_debut}) - Spectacle: ${spectacle?.title ?? "N/A"}`
        );
      });
    }
  }

  // Test 3: Vérifier les GRANTs
  console.log("\n🔒 Vérification des GRANTs sur evenements:");
  const secretKey = process.env.SUPABASE_SECRET_KEY!;
  const adminClient = createSupabaseClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: grants } = await adminClient.rpc("sql", {
    query: `
      SELECT grantee, privilege_type
      FROM information_schema.table_privileges
      WHERE table_schema = 'public' AND table_name = 'evenements'
      ORDER BY grantee, privilege_type
    `,
  });

  if (grants) {
    interface Grant {
      grantee: string;
      privilege_type: string;
    }
    const anonGrants = grants.filter((g: Grant) => g.grantee === "anon");
    const authGrants = grants.filter(
      (g: Grant) => g.grantee === "authenticated"
    );

    console.log(
      `  anon: ${anonGrants.map((g: Grant) => g.privilege_type).join(", ") || "AUCUN"}`
    );
    console.log(
      `  authenticated: ${authGrants.map((g: Grant) => g.privilege_type).join(", ") || "AUCUN"}`
    );
  }

  console.log("\n✅ Tests terminés");
}

main().catch(console.error);

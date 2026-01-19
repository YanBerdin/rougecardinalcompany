#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

async function checkCloudData() {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY!
  );

  console.log("🔍 Vérification des données dans la base cloud...\n");

  // 1. Vérifier le profil admin
  console.log("📝 1. Profil admin:");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, role, created_at, updated_at")
    .eq("user_id", "1616b6fc-95b4-4931-b7e1-e9717def4164")
    .single();

  if (profileError) {
    console.error("❌ Erreur:", profileError.message);
  } else if (profile) {
    console.log("✅ Profil trouvé:");
    console.log(`   - display_name: ${profile.display_name || "❌ NULL"}`);
    console.log(`   - role: ${profile.role}`);
    console.log(`   - created_at: ${profile.created_at}`);
    console.log(`   - updated_at: ${profile.updated_at}`);
  } else {
    console.log("⚠️  Profil non trouvé");
  }

  // 2. Vérifier les spectacles
  console.log("\n📝 2. Spectacles (seeds):");
  const { count: spectaclesCount, error: spectaclesError } = await supabase
    .from("spectacles")
    .select("*", { count: "exact", head: true });

  if (spectaclesError) {
    console.error("❌ Erreur:", spectaclesError.message);
  } else {
    console.log(`   - Nombre de spectacles: ${spectaclesCount || 0}`);
  }

  // 3. Vérifier les hero slides
  console.log("\n📝 3. Hero Slides (seeds):");
  const { count: heroCount, error: heroError } = await supabase
    .from("home_hero_slides")
    .select("*", { count: "exact", head: true });

  if (heroError) {
    console.error("❌ Erreur:", heroError.message);
  } else {
    console.log(`   - Nombre de hero slides: ${heroCount || 0}`);
  }

  // 4. Vérifier les partners
  console.log("\n📝 4. Partners (seeds):");
  const { data: partnersData, count: partnersCount, error: partnersError } = await supabase
    .from("partners")
    .select("id, name, logo_url, logo_media_id, is_active", { count: "exact" });

  if (partnersError) {
    console.error("❌ Erreur:", partnersError.message);
  } else {
    console.log(`   - Nombre de partners: ${partnersCount || 0}`);
    if (partnersData && partnersData.length > 0) {
      console.log("   - Exemples:");
      partnersData.slice(0, 3).forEach(p => {
        const logoSource = p.logo_media_id ? "media_library" : (p.logo_url ? "external_url" : "none");
        console.log(`     • ${p.name} (active: ${p.is_active}, logo: ${logoSource})`);
      });
    }
  }

  // 5. Vérifier les membres équipe
  console.log("\n📝 5. Membres équipe (seeds):");
  const { count: teamCount, error: teamError } = await supabase
    .from("membres_equipe")
    .select("*", { count: "exact", head: true });

  if (teamError) {
    console.error("❌ Erreur:", teamError.message);
  } else {
    console.log(`   - Nombre de membres: ${teamCount || 0}`);
  }

  // 6. Vérifier la structure de la table profiles
  console.log("\n📝 6. Structure table profiles:");
  const { data: profileStructure, error: structureError } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  if (structureError) {
    console.error("❌ Erreur:", structureError.message);
  } else if (profileStructure && profileStructure.length > 0) {
    console.log("   Colonnes disponibles:", Object.keys(profileStructure[0]).join(", "));
  }

  console.log("\n✅ Vérification terminée");
}

checkCloudData().catch(console.error);

//TODO: ❌ Invalid environment variables - to be fixed before production use
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { env } from "../lib/env";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY
);

async function checkBuckets() {
  console.log("🔍 Vérification des buckets Storage...\n");

  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("❌ Erreur:", error);
    return;
  }

  console.log("📦 Buckets trouvés:");
  data.forEach((bucket) => {
    console.log(`  - ${bucket.name} (public: ${bucket.public})`);
  });

  // Test public access to medias bucket
  console.log("\n🔓 Test accès public au bucket 'medias':");
  
  // List all files at root level
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from("medias")
    .list("", { limit: 100 });

  if (rootError) {
    console.error("  ❌ Erreur listing root:", rootError);
  } else if (rootFiles) {
    console.log(`  📁 Dossiers/fichiers à la racine: ${rootFiles.length}`);
    rootFiles.forEach((item) => {
      console.log(`    - ${item.name} ${item.id ? '(file)' : '(folder)'}`);
    });
  }

  // List files in press-kit/logos
  const { data: files } = await supabase.storage
    .from("medias")
    .list("press-kit/logos", { limit: 10 });

  if (files && files.length > 0) {
    console.log(`\n  ✅ ${files.length} fichiers trouvés dans press-kit/logos/`);
    files.forEach((file) => {
      const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/press-kit/logos/${file.name}`;
      console.log(`    - ${file.name}`);
      console.log(`      URL: ${url}`);
    });
  } else {
    console.log("\n  ⚠️  Aucun fichier dans press-kit/logos/");
  }
}

checkBuckets();

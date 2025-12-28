import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStoragePaths() {
  console.log("🔍 Vérification des storage_path dans la table medias...\n");

  const { data, error } = await supabase
    .from("medias")
    .select("id, filename, storage_path, mime")
    .limit(10);

  if (error) {
    console.error("❌ Erreur:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️  Aucun média trouvé");
    return;
  }

  console.log(`📊 ${data.length} médias trouvés:\n`);
  
  data.forEach((media) => {
    console.log(`ID: ${media.id}`);
    console.log(`  Filename: ${media.filename}`);
    console.log(`  Storage Path: ${media.storage_path}`);
    console.log(`  MIME: ${media.mime}`);
    
    // Test URL construction
    const url = `${supabaseUrl}/storage/v1/object/public/medias/${media.storage_path}`;
    console.log(`  URL: ${url}`);
    console.log("");
  });
}

checkStoragePaths();

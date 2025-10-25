/**
 * Script pour tester la vue publique articles_presse_public
 */
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

// Force load .env.local
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

console.log("🔍 Testing articles_presse_public view with ANON key...\n");

const supabase = createClient(supabaseUrl, anonKey);

async function testPublicView() {
  console.log("1️⃣ Querying articles_presse_public view:");
  const { data, error } = await supabase
    .from("articles_presse_public")
    .select(
      "id, title, author, type, excerpt, source_publication, source_url, published_at"
    )
    .order("published_at", { ascending: false });

  if (error) {
    console.error("   ❌ Error:", error);
  } else {
    console.log(`   ✅ Found ${data?.length || 0} articles via public view!`);
    if (data && data.length > 0) {
      console.log("\n📰 Articles found:");
      data.forEach((article, idx) => {
        console.log(`\n   ${idx + 1}. ${article.title}`);
        console.log(`      Author: ${article.author}`);
        console.log(`      Type: ${article.type}`);
        console.log(`      Source: ${article.source_publication}`);
        console.log(`      Published: ${article.published_at}`);
      });
    }
  }
}

testPublicView().catch(console.error);

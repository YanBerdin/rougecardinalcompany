/**
 * Vérifie que chapo et excerpt sont bien présents dans les données
 */
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";
import { env } from "../../lib/env";

const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

console.log("🔍 Checking chapo and excerpt columns...\n");

const supabase = createClient(supabaseUrl, anonKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from("articles_presse_public")
    .select("id, title, type, chapo, excerpt")
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  console.log(`✅ Found ${data?.length || 0} articles\n`);

  data?.forEach((article) => {
    console.log(`📰 Article #${article.id}: ${article.title}`);
    console.log(`   Type: ${article.type}`);
    console.log(
      `   Chapo: ${article.chapo ? article.chapo.substring(0, 60) + "..." : "NULL"}`
    );
    console.log(
      `   Excerpt: ${article.excerpt ? article.excerpt.substring(0, 60) + "..." : "NULL"}`
    );
    console.log(
      `   → Used value: ${article.excerpt ?? article.chapo ?? "EMPTY"}`
    );
    console.log();
  });
}

checkColumns().catch(console.error);

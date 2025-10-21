/**
 * Vérifie que chapo et excerpt sont retournés séparément
 */
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

console.log("🔍 Testing separate chapo and excerpt fields...\n");

const supabase = createClient(supabaseUrl, anonKey);

async function testSeparateFields() {
  const { data, error } = await supabase
    .from("articles_presse_public")
    .select("id, title, type, chapo, excerpt")
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  console.log(`✅ Found ${data?.length || 0} articles\n`);

  // Simulate DAL processing
  const processed = data?.map((row: any) => ({
    id: Number(row.id),
    title: String(row.title ?? ""),
    type: String(row.type ?? ""),
    chapo: String(row.chapo ?? ""),
    excerpt: String(row.excerpt ?? ""),
  }));

  processed?.forEach((article) => {
    console.log(`📰 Article #${article.id}: ${article.title}`);
    console.log(`   Type: ${article.type}`);
    console.log(
      `   Chapo (${article.chapo.length} chars): ${article.chapo.substring(0, 50)}...`
    );
    console.log(
      `   Excerpt (${article.excerpt.length} chars): ${article.excerpt.substring(0, 50)}...`
    );
    console.log();
  });
}

testSeparateFields().catch(console.error);

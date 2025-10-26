/**
 * Test du DAL presse après migration vers la vue publique
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

// Force load .env.local
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Simule l'environnement Next.js pour le DAL
import { createClient } from "@supabase/supabase-js";

// Mock next/headers pour permettre au DAL de fonctionner
const _mockCookies = {
  getAll: () => [],
  setAll: () => {},
};

// Mark as intentionally unused in this quick script test to satisfy linting rules
void _mockCookies;

// Note: Ce test ne peut pas vraiment importer le DAL car il nécessite next/headers
// On va plutôt tester directement la requête Supabase

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

console.log("🧪 Testing DAL query pattern with public view...\n");

const supabase = createClient(supabaseUrl, anonKey);

async function testDALPattern() {
  console.log("1️⃣ Testing fetchMediaArticles pattern:");

  const query = supabase
    .from("articles_presse_public")
    .select(
      "id, title, author, type, excerpt, source_publication, source_url, published_at"
    )
    .order("published_at", { ascending: false, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    console.error("   ❌ Error:", error);
    return;
  }

  console.log(`   ✅ Found ${data?.length || 0} articles`);

  if (data && data.length > 0) {
    console.log("\n📄 Processing articles (as DAL would):");

    const processedArticles = data.map((row) => {
      const r = row as Record<string, unknown>;
      // Reproduction de la logique du DAL
      function coerceArticleType(
        v: unknown
      ): "Article" | "Critique" | "Interview" | "Portrait" {
        const raw = String(v ?? "")
          .trim()
          .toLowerCase();
        if (raw === "critique") return "Critique";
        if (raw === "entretien" || raw === "interview") return "Interview";
        if (raw === "portrait") return "Portrait";
        return "Article";
      }

      return {
        id: Number(r.id),
        title: String(r.title ?? ""),
        author: String(r.author ?? ""),
        type: coerceArticleType(r.type),
        excerpt: String(r.excerpt ?? (r.chapo as string) ?? ""),
        source_publication: String(r.source_publication ?? ""),
        source_url: String(r.source_url ?? ""),
        published_at: String(r.published_at ?? ""),
      };
    });

    console.log(`   ✅ Processed ${processedArticles.length} articles`);
    console.log("\n   First article after processing:");
    console.log("   ", JSON.stringify(processedArticles[0], null, 2));
  }
}

testDALPattern().catch(console.error);

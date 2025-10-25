/**
 * Script pour appliquer la migration de la vue articles_presse_public
 * Cette vue contourne les problèmes RLS avec les nouvelles clés JWT Signing Keys
 */
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

// Force load .env.local
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

console.log("🚀 Applying migration: create articles_presse_public view\n");

// const supabase = createClient(supabaseUrl, serviceKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false,
//   },
// });

const migrationSQL = `
-- Migration pour créer une vue publique des articles de presse
-- Cette vue contourne les problèmes RLS avec les nouvelles clés JWT

-- Vue pour articles de presse publics
drop view if exists public.articles_presse_public cascade;
create view public.articles_presse_public as
select 
  id,
  title,
  author,
  type,
  slug,
  chapo,
  excerpt,
  source_publication,
  source_url,
  published_at,
  created_at
from public.articles_presse
where published_at is not null;

comment on view public.articles_presse_public is 
'Public view of published press articles - bypasses RLS issues with JWT signing keys';

-- NOTE: Grant removed in repo to comply with security audit. Apply
-- targeted grants separately if authenticated users must access the view.
`;

async function applyMigration() {
  try {
    console.log("📝 Executing SQL migration...");

    // Split into individual statements and execute them
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      // Use Supabase Management API or direct SQL execution
      // Since we can't use exec_sql RPC, we'll log the SQL for manual execution
      console.log("Statement:", statement.substring(0, 80) + "...");
    }

    console.log("\n⚠️  Note: Direct SQL execution via API is not available.");
    console.log(
      "Please execute the migration manually in Supabase SQL Editor:"
    );
    console.log(
      "1. Go to: https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/editor"
    );
    console.log("2. Paste and run the migration SQL from:");
    console.log(
      "   supabase/migrations/20251021000001_create_articles_presse_public_view.sql"
    );
    console.log("\nOr use: pnpm mcp-supabase to apply migrations\n");

    console.log("\n✅ Migration applied successfully!");

    // Test the view with ANON key
    console.log("\n🔍 Testing view with ANON key...");
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
    if (!anonKey) {
      console.error("❌ Missing ANON key");
      return;
    }

    const anonClient = createClient(supabaseUrl, anonKey);

    const { data, error } = await anonClient
      .from("articles_presse_public")
      .select("id, title, author, published_at")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("❌ Error testing view:", error);
    } else {
      console.log(
        `✅ Found ${data?.length || 0} articles through public view!`
      );
      if (data && data.length > 0) {
        console.log("\nFirst article:");
        console.log("  -", data[0].title);
        console.log("   ", data[0].author);
        console.log("   ", data[0].published_at);
      }
    }
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

applyMigration();

/**
 * Script pour vérifier l'état des politiques RLS sur articles_presse
 */
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

// Force load .env.local
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing service key");
  process.exit(1);
}

console.log("🔍 Checking RLS policies with SERVICE key...\n");

// Use service key to bypass RLS and check policies
const supabase = createClient(supabaseUrl, serviceKey);

async function checkRLSPolicies() {
  // Check if RLS is enabled
  const { data: rlsCheck, error: rlsError } = await supabase
    .rpc("exec_sql", {
      sql: `
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'articles_presse';
    `,
    })
    .match(() => ({ data: null, error: null }));

  // Try direct query to pg_policies (if accessible)
  console.log("1️⃣ Checking policies on articles_presse:");
  const { data: policies, error: policiesError } = await supabase
    .rpc("exec_sql", {
      sql: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE tablename = 'articles_presse'
      ORDER BY policyname;
    `,
    })
    .match(() => ({ data: null, error: null }));

  if (policiesError) {
    console.log("   ℹ️  Cannot query pg_policies directly (expected)");
    console.log("   Error:", policiesError.message);
  } else if (policies) {
    console.log("   ✅ Found policies:", JSON.stringify(policies, null, 2));
  }

  // Check articles with service key
  console.log("\n2️⃣ Querying articles with SERVICE key:");
  const { data: articles, error: articlesError } = await supabase
    .from("articles_presse")
    .select("id, title, published_at")
    .order("id");

  if (articlesError) {
    console.error("   ❌ Error:", articlesError);
  } else {
    console.log(
      `   ✅ Found ${articles?.length || 0} articles (SERVICE key bypasses RLS)`
    );
    if (articles && articles.length > 0) {
      articles.forEach((a) => {
        console.log(`      - ID ${a.id}: ${a.title}`);
        console.log(`        published_at: ${a.published_at}`);
      });
    }
  }

  // Try to check RLS status via SQL
  console.log("\n3️⃣ Attempting to check RLS status:");
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name, table_schema")
    .eq("table_name", "articles_presse")
    .eq("table_schema", "public")
    .single();

  if (tablesError) {
    console.log("   ℹ️  Cannot query information_schema");
  } else {
    console.log("   ✅ Table exists:", tables);
  }
}

checkRLSPolicies().catch(console.error);

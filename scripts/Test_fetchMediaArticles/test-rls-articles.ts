/**
 * Script de diagnostic RLS pour articles_presse
 * Teste l'accès aux articles avec la clé ANON (comme le fait l'app)
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
  console.error("❌ Missing env vars:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
  console.error("   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:", anonKey?.substring(0, 20) + "...");
  process.exit(1);
}

console.log("🔍 Testing RLS with ANON key (as used in the app)...\n");

// Create client with ANON key (same as the app)
const supabase = createClient(supabaseUrl, anonKey);

async function testRLS() {
  console.log("1️⃣ Testing basic query with published_at filter:");
  const { data: withFilter, error: error1 } = await supabase
    .from("articles_presse")
    .select("id, title, author, type, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error1) {
    console.error("   ❌ Error:", error1);
  } else {
    console.log(`   ✅ Found ${withFilter?.length || 0} articles with filter`);
    if (withFilter && withFilter.length > 0) {
      console.log("   First article:", {
        id: withFilter[0].id,
        title: withFilter[0].title,
        published_at: withFilter[0].published_at,
      });
    }
  }

  console.log("\n2️⃣ Testing query without filter (should also work due to RLS):");
  const { data: withoutFilter, error: error2 } = await supabase
    .from("articles_presse")
    .select("id, title, author, type, published_at")
    .order("id", { ascending: true });

  if (error2) {
    console.error("   ❌ Error:", error2);
  } else {
    console.log(`   ✅ Found ${withoutFilter?.length || 0} articles without filter`);
    if (withoutFilter && withoutFilter.length > 0) {
      console.log("   Articles:", withoutFilter.map(a => ({
        id: a.id,
        published_at: a.published_at,
      })));
    }
  }

  console.log("\n3️⃣ Testing exact query from DAL:");
  const { data: dalQuery, error: error3 } = await supabase
    .from("articles_presse")
    .select(
      "id, title, author, type, excerpt, source_publication, source_url, published_at"
    )
    .not("published_at", "is", null)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error3) {
    console.error("   ❌ Error:", error3);
  } else {
    console.log(`   ✅ Found ${dalQuery?.length || 0} articles with DAL query`);
    if (dalQuery && dalQuery.length > 0) {
      console.log("   First article full data:");
      console.log("   ", JSON.stringify(dalQuery[0], null, 2));
    }
  }

  console.log("\n4️⃣ Checking RLS policies:");
  const { data: policies, error: error4 } = await supabase.rpc("get_current_timestamp");
  
  if (error4) {
    console.error("   ❌ Connection test failed:", error4);
  } else {
    console.log("   ✅ Connection OK, timestamp:", policies);
  }
}

testRLS().catch(console.error);

/**
 * Check admin status for a user
 * Usage: pnpm exec tsx scripts/check-admin-status.ts [email]
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const email = process.argv[2] || "yandevformation@gmail.com";

async function checkAdminStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  if (!supabaseSecretKey && !anonKey) {
    console.error("❌ Missing both SUPABASE_SERVICE_KEY and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY");
    process.exit(1);
  }

  const key = supabaseSecretKey || anonKey!;
  const keyType = supabaseSecretKey ? "service_role" : "anon/publishable";
  
  console.log(`🔑 Using ${keyType} key`);
  
  const supabase = createClient(supabaseUrl, key);

  console.log(`\n🔍 Checking admin status for: ${email}\n`);

  // List all users
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Error listing users:", listError);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email === email);

  if (!user) {
    console.log("❌ User not found");
    process.exit(1);
  }

  console.log("✅ User found:");
  console.log(`   📧 Email: ${user.email}`);
  console.log(`   🆔 User ID: ${user.id}`);
  console.log(`   📅 Created: ${user.created_at}`);
  console.log(`   🔐 Email Confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`);
  console.log("");

  // Check metadata
  console.log("📋 App Metadata:");
  if (user.app_metadata && Object.keys(user.app_metadata).length > 0) {
    console.log(JSON.stringify(user.app_metadata, null, 2));
  } else {
    console.log("   (empty)");
  }
  console.log("");

  console.log("👤 User Metadata:");
  if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
    console.log(JSON.stringify(user.user_metadata, null, 2));
  } else {
    console.log("   (empty)");
  }
  console.log("");

  // Check if user has admin role in app_metadata
  const isAdminInMetadata = user.app_metadata?.role === "admin";
  console.log(`🎭 Admin in app_metadata: ${isAdminInMetadata ? "✅ Yes" : "❌ No"}`);

  // Try to query is_admin function directly (with this user's auth)
  const { data: adminCheck, error: adminError } = await supabase.rpc("is_admin");

  if (adminError) {
    console.log(`⚠️  Could not call is_admin(): ${adminError.message}`);
  } else {
    console.log(`🔐 is_admin() returns: ${adminCheck ? "✅ true" : "❌ false"}`);
  }

  console.log("");
  console.log("💡 To make this user an admin, run:");
  console.log(`   UPDATE auth.users`);
  console.log(`   SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb`);
  console.log(`   WHERE id = '${user.id}';`);
  console.log("");
}

checkAdminStatus().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

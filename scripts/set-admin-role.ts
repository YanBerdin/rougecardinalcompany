/**
 * Add admin role to a user
 * Usage: pnpm exec tsx scripts/set-admin-role.ts [email]
 */

import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const email = process.argv[2] || "yandevformation@gmail.com";

async function setAdminRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("\n❌ Missing SUPABASE_SECRET_KEY in .env.local");
    console.error("\n📋 To add admin role manually:");
    console.error("\n1. Go to https://supabase.com/dashboard");
    console.error("2. Select your project");
    console.error("3. Go to SQL Editor");
    console.error("4. Run this query:\n");
    console.error(`UPDATE auth.users`);
    console.error(
      `SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb`
    );
    console.error(`WHERE email = '${email}';\n`);
    process.exit(1);
  }

  // Dynamic import to avoid loading if we don't have the key
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`\n🔧 Setting admin role for: ${email}\n`);

  // Get user
  const { data: usersData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Error listing users:", listError);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email === email);

  if (!user) {
    console.log("❌ User not found");
    process.exit(1);
  }

  // Update user metadata
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, role: "admin" },
  });

  if (error) {
    console.error("❌ Error updating user:", error);
    process.exit(1);
  }

  console.log("✅ Admin role added successfully!");
  console.log(`   📧 Email: ${data.user.email}`);
  console.log(`   🆔 User ID: ${data.user.id}`);
  console.log(
    `   📋 App Metadata:`,
    JSON.stringify(data.user.app_metadata, null, 2)
  );
  console.log("");
  console.log(
    "🔄 User needs to log out and log back in for changes to take effect"
  );
  console.log("");
}

setAdminRole().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

// scripts/check-email-logs.ts
// Check email delivery logs in Supabase database

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const envVars: Record<string, string> = {};

    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        if (value) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, ""); // Remove quotes
        }
      }
    });

    return envVars;
  } catch (error) {
    console.log("⚠️  Could not load .env.local file, error:", error);
    return {};
  }
}

async function checkEmailLogs() {
  console.log("📊 Checking email delivery logs...\n");

  // Load environment variables
  const envVars = loadEnv();

  // Check environment variables
  const supabaseUrl =
    envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  // ❌ LEGACY FORMAT service_role key first (bypasses RLS)
  // ❌ LEGACY FORMAT - Only use if not migrated to JWT Signing Keys
  // ✅ NEW FORMAT - SUPABASE_SECRET_KEY
  const supabaseKey =
    envVars.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  const isServiceRole = !!(
    //  envVars.SUPABASE_SERVICE_ROLE_KEY ||
    //  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    (envVars.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY)
  );

  if (!supabaseUrl || !supabaseKey) {
    console.log("❌ Missing Supabase environment variables");
    console.log("   Make sure your .env.local file has:");
    console.log("   NEXT_PUBLIC_SUPABASE_URL=...");
    console.log(
      "   SUPABASE_SERVICE_ROLE_KEY=... or SUPABASE_SECRET_KEY=... (for admin access)"
    );
    console.log("   or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...");
    console.log(
      "\n   💡 You can find these values in your Supabase dashboard:"
    );
    console.log(
      "   https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api"
    );
    return;
  }

  if (!isServiceRole) {
    console.log("⚠️  Using anon key (limited by RLS policies)");
    console.log(
      "   To view all data including contact messages, add to .env.local:"
    );
    console.log(
      "   SUPABASE_SERVICE_ROLE_KEY=your_key or SUPABASE_SECRET_KEY=your_key\n"
    );
  } else {
    console.log("✅ Using service_role key (admin access, bypasses RLS)\n");
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check newsletter subscriptions
    console.log("📰 Checking newsletter subscriptions...");
    const { data: newsletterData, error: newsletterError } = await supabase
      .from("abonnes_newsletter")
      .select("email, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (newsletterError) {
      console.log("❌ Newsletter query failed:", newsletterError.message);
      if (newsletterError.message.includes("Legacy API keys are disabled")) {
        console.log("\n   ⚠️  LEGACY API KEYS DETECTED");
        console.log(
          "   Your Supabase API keys are outdated and have been disabled."
        );
        console.log("\n   🔧 How to fix:");
        console.log(
          "   1. Go to: https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api"
        );
        console.log(
          "   2. Click 'Generate new anon key' and 'Generate new service_role key'"
        );
        console.log("   3. Update your .env.local with the new keys:");
        console.log(
          "      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=new_anon_key"
        );
        console.log("      SUPABASE_SECRET_KEY=new_service_role_key");
        console.log(
          "\n   📚 More info: https://supabase.com/docs/guides/api#api-url-and-keys\n"
        );
      }
    } else {
      console.log("✅ Newsletter subscriptions (last 5):");
      if (newsletterData && newsletterData.length > 0) {
        newsletterData.forEach((item, index) => {
          console.log(
            `   ${index + 1}. ${item.email} - ${new Date(item.created_at).toLocaleString()}`
          );
        });
      } else {
        console.log("   No newsletter subscriptions found");
      }
    }

    // Check contact messages
    console.log("\n📬 Checking contact messages...");
    const { data: contactData, error: contactError } = await supabase
      .from("messages_contact")
      .select("firstname, lastname, email, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (contactError) {
      console.log("❌ Contact query failed:", contactError.message);
      if (contactError.message.includes("Legacy API keys are disabled")) {
        console.log("\n   ⚠️  LEGACY API KEYS DETECTED");
        console.log(
          "   Your Supabase API keys are outdated and have been disabled."
        );
        console.log("\n   🔧 How to fix:");
        console.log(
          "   1. Go to: https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api"
        );
        console.log(
          "   2. Click 'Generate new anon key' and 'Generate new service_role key'"
        );
        console.log("   3. Update your .env.local with the new keys:");
        console.log(
          "      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=new_anon_key"
        );
        console.log("      SUPABASE_SECRET_KEY=new_service_role_key");
        console.log(
          "\n   📚 More info: https://supabase.com/docs/guides/api#api-url-and-keys\n"
        );
      } else if (
        contactError.message.includes("row-level security") ||
        !isServiceRole
      ) {
        console.log("   💡 This table requires admin access (RLS policy)");
        console.log("   Add SUPABASE_SECRET_KEY to your .env.local file");
      }
    } else {
      console.log("✅ Contact messages (last 5):");
      if (contactData && contactData.length > 0) {
        contactData.forEach((item, index) => {
          const fullName =
            `${item.firstname || ""} ${item.lastname || ""}`.trim() ||
            "Anonymous";
          console.log(
            `   ${index + 1}. ${fullName} <${item.email}> - "${item.reason}" - ${new Date(item.created_at).toLocaleString()}`
          );
        });
      } else {
        console.log("   No contact messages found");
        if (!isServiceRole) {
          console.log("   💡 Note: messages_contact has RLS enabled");
          console.log("   You need SUPABASE_SECRET_KEY to view this data");
        }
      }
    }

    console.log("\n🎉 Database check completed!");
  } catch (error) {
    console.error("❌ Database check failed:", error);
  }
}

// Run the check
checkEmailLogs();

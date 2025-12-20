// scripts/test-env-validation.ts
/**
 * Test T3 Env validation
 * Run with: pnpm tsx scripts/test-env-validation.ts
 */

import { env } from "../lib/env";

console.log("🧪 Testing T3 Env validation...\n");

// ============================================================================
// Test 1: Server variables
// ============================================================================
console.log("✅ Server variables:");
console.log(`  SUPABASE_URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`  RESEND_API_KEY: ${env.RESEND_API_KEY.slice(0, 10)}...`);
console.log(`  EMAIL_FROM: ${env.EMAIL_FROM}`);
console.log(`  EMAIL_CONTACT: ${env.EMAIL_CONTACT}`);
console.log(`  NODE_ENV: ${env.NODE_ENV}`);

// ============================================================================
// Test 2: Client variables
// ============================================================================
console.log("\n✅ Client variables:");
console.log(`  SITE_URL: ${env.NEXT_PUBLIC_SITE_URL}`);

// ============================================================================
// Test 3: Development redirect
// ============================================================================
console.log("\n✅ Development redirect:");
console.log(`  DEV_REDIRECT: ${env.EMAIL_DEV_REDIRECT}`);
console.log(`  REDIRECT_TO: ${env.EMAIL_DEV_REDIRECT_TO ?? "not set"}`);

if (env.NODE_ENV === "development" && env.EMAIL_DEV_REDIRECT) {
  console.log("\n⚠️  WARNING: Email redirect is ENABLED in development");
  console.log(`   All emails will go to: ${env.EMAIL_DEV_REDIRECT_TO}`);
}

// ============================================================================
// Test 4: Production safety checks
// ============================================================================
if (env.NODE_ENV === "production") {
  console.log("\n🔒 Production safety checks:");
  
  if (env.EMAIL_DEV_REDIRECT) {
    console.error("❌ CRITICAL: EMAIL_DEV_REDIRECT is enabled in production!");
    process.exit(1);
  }
  
  if (!env.EMAIL_FROM.includes("rougecardinalcompany")) {
    console.warn("⚠️  EMAIL_FROM doesn't use company domain");
  }
  
  console.log("✅ All production checks passed");
}

console.log("\n✅ All env variables validated successfully!");

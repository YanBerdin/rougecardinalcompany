#!/usr/bin/env tsx
/**
 * Script de test pour validation T3 Env
 * Usage: pnpm tsx scripts/test-env-validation.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first (highest priority), then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

console.log("🧪 Testing T3 Env validation...\n");

try {
  // Test 1: Import env config
  console.log("📦 Test 1: Loading env config...");
  const { env } = await import("../lib/env");
  console.log("✅ Env config loaded successfully\n");

  // Test 2: Validate required server vars
  console.log("🔐 Test 2: Validating required server variables...");
  const requiredServerVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
    "SUPABASE_SECRET_KEY",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "EMAIL_CONTACT",
  ];

  for (const varName of requiredServerVars) {
    const value = env[varName as keyof typeof env];
    if (!value) {
      throw new Error(`❌ Missing required variable: ${varName}`);
    }
    console.log(`  ✓ ${varName}: ${String(value).slice(0, 20)}...`);
  }
  console.log("✅ All required server variables validated\n");

  // Test 3: Validate client vars
  console.log("🌐 Test 3: Validating client variables...");
  const requiredClientVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ];

  for (const varName of requiredClientVars) {
    const value = env[varName as keyof typeof env];
    if (!value) {
      throw new Error(`❌ Missing required client variable: ${varName}`);
    }
    console.log(`  ✓ ${varName}: ${String(value)}`);
  }
  console.log("✅ All client variables validated\n");

  // Test 4: Check optional vars
  console.log("🔧 Test 4: Checking optional variables...");
  const optionalVars = [
    "EMAIL_DEV_REDIRECT",
    "EMAIL_DEV_REDIRECT_TO",
    "TEST_DB_URL",
    "SUPABASE_PROJECT_REF",
    "SUPABASE_ACCESS_TOKEN",
    "GITHUB_TOKEN",
    "CONTEXT7_API_KEY",
  ];

  for (const varName of optionalVars) {
    const value = env[varName as keyof typeof env];
    console.log(
      `  ${value ? "✓" : "○"} ${varName}: ${value ? String(value).slice(0, 20) + "..." : "not set (optional)"}`
    );
  }
  console.log("✅ Optional variables checked\n");

  // Test 5: Validate EMAIL_DEV_REDIRECT logic
  console.log("📧 Test 5: Validating email dev redirect logic...");
  const devRedirectEnabled = env.EMAIL_DEV_REDIRECT;
  console.log(`  EMAIL_DEV_REDIRECT: ${devRedirectEnabled}`);
  
  if (devRedirectEnabled && !env.EMAIL_DEV_REDIRECT_TO) {
    console.warn("  ⚠️  EMAIL_DEV_REDIRECT is true but EMAIL_DEV_REDIRECT_TO is not set");
  } else if (devRedirectEnabled && env.EMAIL_DEV_REDIRECT_TO) {
    console.log(`  ✓ Dev redirect enabled to: ${env.EMAIL_DEV_REDIRECT_TO}`);
  } else {
    console.log("  ○ Dev redirect disabled (production mode)");
  }
  console.log("✅ Email dev redirect validated\n");

  // Test 6: Check NODE_ENV
  console.log("⚙️  Test 6: Checking NODE_ENV...");
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);
  if (env.NODE_ENV === "production") {
    if (env.EMAIL_DEV_REDIRECT) {
      console.error("  ❌ EMAIL_DEV_REDIRECT should be false in production!");
      process.exit(1);
    }
  }
  console.log("✅ NODE_ENV validated\n");

  console.log("🎉 All tests passed! T3 Env validation successful.\n");
  process.exit(0);
} catch (error) {
  console.error("\n❌ T3 Env validation failed:");
  if (error instanceof Error) {
    console.error(`  ${error.message}\n`);
    if (error.stack) {
      console.error("Stack trace:");
      console.error(error.stack);
    }
  } else {
    console.error(error);
  }
  process.exit(1);
}
export { };


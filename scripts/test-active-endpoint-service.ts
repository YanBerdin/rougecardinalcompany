#!/usr/bin/env tsx

/**
 * Test script for /api/admin/team/[id]/active endpoint using Service Role Key
 * 
 * This bypasses RLS and tests the endpoint logic directly without needing admin cookies
 * 
 * Usage:
 *   pnpm exec tsx scripts/test-active-endpoint-service.ts
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;
const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  /https:\/\/[^.]+\.supabase\.co/,
  "http://localhost:3000"
) || "http://localhost:3000";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  name: string;
  success: boolean;
  expectedStatus: number;
  actualStatus: number;
  response: unknown;
}

async function ensureTestMemberExists(): Promise<number> {
  // Chercher un membre existant
  const { data: existing } = await supabase
    .from("membres_equipe")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    console.log(`✅ Using existing team member ID: ${existing.id}\n`);
    return existing.id;
  }

  // Créer un membre de test si aucun n'existe
  const { data: created, error } = await supabase
    .from("membres_equipe")
    .insert({
      nom: "Test Member (auto-created)",
      prenom: "Script",
      role: "test",
      active: true,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(`Failed to create test member: ${error?.message}`);
  }

  console.log(`✅ Created test member ID: ${created.id}\n`);
  return created.id;
}

async function testEndpoint(
  testName: string,
  memberId: number,
  body: unknown,
  expectedStatus: number
): Promise<TestResult> {
  try {
    // Get admin session token (using service key bypasses RLS)
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${API_URL}/api/admin/team/${memberId}/active`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include auth header if we have a session
        ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const success = response.status === expectedStatus;

    console.log(`🧪 Test: ${testName}`);
    console.log(`   Request: POST /api/admin/team/${memberId}/active`);
    console.log(`   Body: ${JSON.stringify(body)}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data)}`);
    console.log(success ? "✅ PASS" : `❌ FAIL - Expected status ${expectedStatus}, got ${response.status}`);
    console.log("");

    return {
      name: testName,
      success,
      expectedStatus,
      actualStatus: response.status,
      response: data,
    };
  } catch (error) {
    console.error(`❌ Test "${testName}" threw error:`, error);
    return {
      name: testName,
      success: false,
      expectedStatus,
      actualStatus: 0,
      response: { error: String(error) },
    };
  }
}

async function main() {
  console.log("================================================");
  console.log("Testing /api/admin/team/[id]/active endpoint");
  console.log("Using Service Role Key for authentication");
  console.log("================================================\n");

  const memberId = await ensureTestMemberExists();

  const results: TestResult[] = [];

  // Valid inputs (should return 200)
  results.push(await testEndpoint("Boolean natif (true)", memberId, { active: true }, 200));
  results.push(await testEndpoint("Boolean natif (false)", memberId, { active: false }, 200));
  results.push(await testEndpoint('String "true"', memberId, { active: "true" }, 200));
  results.push(await testEndpoint('String "false"', memberId, { active: "false" }, 200));
  results.push(await testEndpoint("Number 1 (active)", memberId, { active: 1 }, 200));
  results.push(await testEndpoint("Number 0 (inactive)", memberId, { active: 0 }, 200));

  // Invalid values (should return 422)
  results.push(await testEndpoint('Invalid value (string "maybe")', memberId, { active: "maybe" }, 422));
  results.push(await testEndpoint("Invalid value (number 2)", memberId, { active: 2 }, 422));
  results.push(await testEndpoint("Invalid value (number -1)", memberId, { active: -1 }, 422));
  results.push(await testEndpoint("Missing active field", memberId, {}, 422));
  results.push(await testEndpoint("Null value", memberId, { active: null }, 422));
  results.push(await testEndpoint("Array value", memberId, { active: [true] }, 422));
  results.push(await testEndpoint("Object value", memberId, { active: { value: true } }, 422));

  // Invalid IDs (should return 400)
  results.push(await testEndpoint("Invalid ID (non-numeric)", "abc" as any, { active: true }, 400));
  results.push(await testEndpoint("Invalid ID (negative)", -1, { active: true }, 400));
  results.push(await testEndpoint("Invalid ID (zero)", 0, { active: true }, 400));
  results.push(await testEndpoint("Invalid ID (decimal)", 1.5, { active: true }, 400));

  // Summary
  console.log("================================================");
  console.log("Test Summary");
  console.log("================================================");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.name} (expected ${r.expectedStatus}, got ${r.actualStatus})`);
      });
    process.exit(1);
  }

  console.log("\n✅ All tests passed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});

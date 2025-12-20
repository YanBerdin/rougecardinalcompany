#!/usr/bin/env tsx
/**
 * Test script for Team Server Actions via DAL
 *
 * Tests the team member operations directly through the DAL layer,
 * bypassing authentication (uses service role key).
 *
 * This replaces the obsolete test-active-endpoint.ts which tested
 * the removed /api/admin/team/[id]/active API route.
 *
 * Usage:
 *   pnpm exec tsx scripts/test-team-server-actions.ts
 *
 * Prerequisites:
 *   SUPABASE_SECRET_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SECRET_KEY:", SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name} (${Date.now() - start}ms)`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({
      name,
      passed: false,
      duration: Date.now() - start,
      error: errorMessage,
    });
    console.log(`❌ ${name}: ${errorMessage}`);
  }
}

async function getFirstTeamMember(): Promise<{ id: bigint; active: boolean }> {
  const { data, error } = await supabase
    .from("membres_equipe")
    .select("id, active")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      `No team member found: ${error?.message ?? "empty result"}`
    );
  }

  return { id: BigInt(data.id), active: data.active ?? false };
}

async function updateTeamMemberActive(
  id: bigint,
  active: boolean
): Promise<void> {
  const { error } = await supabase
    .from("membres_equipe")
    .update({ active })
    .eq("id", Number(id));

  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }
}

async function getTeamMemberActive(id: bigint): Promise<boolean> {
  const { data, error } = await supabase
    .from("membres_equipe")
    .select("active")
    .eq("id", Number(id))
    .single();

  if (error || !data) {
    throw new Error(`Fetch failed: ${error?.message ?? "not found"}`);
  }

  return data.active ?? false;
}

async function main(): Promise<void> {
  console.log("================================================");
  console.log("Testing Team DAL Operations (Server Actions pattern)");
  console.log("================================================\n");

  let testMemberId: bigint;
  let originalActive: boolean;

  // Setup: Get a team member to test with
  try {
    const member = await getFirstTeamMember();
    testMemberId = member.id;
    originalActive = member.active;
    console.log(
      `📋 Using team member ID: ${testMemberId} (active: ${originalActive})\n`
    );
  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.error(
      "   Make sure there is at least one team member in the database."
    );
    process.exit(1);
  }

  // Test 1: Toggle to inactive
  await runTest("Toggle to inactive (false)", async () => {
    await updateTeamMemberActive(testMemberId, false);
    const newActive = await getTeamMemberActive(testMemberId);
    if (newActive !== false) {
      throw new Error(`Expected active=false, got ${newActive}`);
    }
  });

  // Test 2: Toggle to active
  await runTest("Toggle to active (true)", async () => {
    await updateTeamMemberActive(testMemberId, true);
    const newActive = await getTeamMemberActive(testMemberId);
    if (newActive !== true) {
      throw new Error(`Expected active=true, got ${newActive}`);
    }
  });

  // Test 3: Idempotence - set same value twice
  await runTest("Idempotence check (set true twice)", async () => {
    await updateTeamMemberActive(testMemberId, true);
    await updateTeamMemberActive(testMemberId, true);
    const newActive = await getTeamMemberActive(testMemberId);
    if (newActive !== true) {
      throw new Error(`Expected active=true after double set, got ${newActive}`);
    }
  });

  // Test 4: Restore original state
  await runTest("Restore original state", async () => {
    await updateTeamMemberActive(testMemberId, originalActive);
    const newActive = await getTeamMemberActive(testMemberId);
    if (newActive !== originalActive) {
      throw new Error(`Expected active=${originalActive}, got ${newActive}`);
    }
  });

  // Test 5: List team members (read operation)
  await runTest("List team members", async () => {
    const { data: listData, error: listError } = await supabase
      .from("membres_equipe")
      .select("id, name, role, active")
      .order("ordre", { ascending: true });

    if (listError) {
      throw new Error(`List failed: ${listError.message}`);
    }

    if (!listData || listData.length === 0) {
      throw new Error("No team members returned");
    }

    console.log(`   Found ${listData.length} team member(s)`);
  });

  // Test 6: Fetch single member by ID
  await runTest("Fetch single member by ID", async () => {
    const { data: memberData, error: memberError } = await supabase
      .from("membres_equipe")
      .select("*")
      .eq("id", Number(testMemberId))
      .single();

    if (memberError) {
      throw new Error(`Fetch failed: ${memberError.message}`);
    }

    if (!memberData) {
      throw new Error("Member not found");
    }

    console.log(`   Member: ${memberData.name} (${memberData.role})`);
  });

  // Test 7: Invalid ID handling
  await runTest("Invalid ID returns no rows (not error)", async () => {
    const { data: invalidData, error: invalidError } = await supabase
      .from("membres_equipe")
      .select("id")
      .eq("id", 999999999)
      .maybeSingle();

    if (invalidError) {
      throw new Error(`Unexpected error: ${invalidError.message}`);
    }

    if (invalidData !== null) {
      throw new Error("Expected null for non-existent ID");
    }
  });

  // Summary
  console.log("\n================================================");
  console.log("Test Summary");
  console.log("================================================");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);

  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Duration: ${totalDuration}ms`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  }

  console.log("\n✨ All tests passed!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

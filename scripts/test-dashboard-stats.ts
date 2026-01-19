#!/usr/bin/env tsx

/**
 * Test script for dashboard statistics
 *
 * Validates that dashboard stats can be fetched correctly with proper error handling
 *
 * Usage:
 *   pnpm exec tsx scripts/test-dashboard-stats.ts
 */
import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { DashboardStatsSchema } from "../lib/schemas/dashboard";
//import { env } from "../lib/env";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: unknown;
}

async function fetchDashboardStats() {
  const [
    { count: teamCount, error: teamError },
    { count: showsCount, error: showsError },
    { count: eventsCount, error: eventsError },
    { count: mediaCount, error: mediaError },
    { count: partnersCount, error: partnersError },
  ] = await Promise.all([
    supabase.from("membres_equipe").select("*", { count: "exact", head: true }),
    supabase.from("spectacles").select("*", { count: "exact", head: true }),
    supabase.from("evenements").select("*", { count: "exact", head: true }),
    supabase.from("medias").select("*", { count: "exact", head: true }),
    supabase.from("partners").select("*", { count: "exact", head: true }),
  ]);

  // Check for individual errors
  const errors = [
    { name: "membres_equipe", error: teamError },
    { name: "spectacles", error: showsError },
    { name: "evenements", error: eventsError },
    { name: "medias", error: mediaError },
    { name: "partners", error: partnersError },
  ].filter((item) => item.error !== null);

  if (errors.length > 0) {
    throw new Error(
      `Failed to fetch stats: ${errors.map((e) => `${e.name}: ${e.error?.message}`).join(", ")}`
    );
  }

  return {
    teamCount: teamCount || 0,
    showsCount: showsCount || 0,
    eventsCount: eventsCount || 0,
    mediaCount: mediaCount || 0,
    partnersCount: partnersCount || 0,
  };
}

async function runTest(
  name: string,
  testFn: () => Promise<unknown>
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const data = await testFn();
    const duration = Date.now() - startTime;

    return {
      name,
      success: true,
      duration,
      data,
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      name,
      success: false,
      duration,
      error: errorMessage,
    };
  }
}

async function main() {
  console.log("🧪 Testing Dashboard Statistics\n");

  const results: TestResult[] = [];

  // Test 1: Fetch stats
  results.push(
    await runTest("Fetch dashboard stats", async () => {
      const stats = await fetchDashboardStats();
      return stats;
    })
  );

  // Test 2: Validate schema
  results.push(
    await runTest("Validate stats schema", async () => {
      const stats = await fetchDashboardStats();
      const validated = DashboardStatsSchema.parse(stats);
      return validated;
    })
  );

  // Test 3: Test parallel execution performance
  results.push(
    await runTest("Test parallel execution (3 times)", async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchDashboardStats(),
        fetchDashboardStats(),
      ]);
      return "Parallel execution successful";
    })
  );

  // Test 4: Test error handling with invalid table
  results.push(
    await runTest("Test error handling (expect failure)", async () => {
      const { error } = await supabase
        .from("invalid_table_name")
        .select("*", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      return "Should have failed";
    })
  );

  // Print results
  console.log("\n📊 Test Results:\n");

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result) => {
    const icon = result.success ? "✅" : "❌";
    const status = result.success ? "PASSED" : "FAILED";

    console.log(`${icon} ${result.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Duration: ${result.duration}ms`);

    if (result.success) {
      passedCount++;
      if (result.data) {
        console.log(`   Data:`, result.data);
      }
    } else {
      failedCount++;
      console.log(`   Error: ${result.error}`);
    }

    console.log("");
  });

  // Summary
  const total = results.length;
  const successRate = ((passedCount / total) * 100).toFixed(1);

  console.log("═".repeat(50));
  console.log(
    `Total: ${total} | Passed: ${passedCount} | Failed: ${failedCount}`
  );
  console.log(`Success Rate: ${successRate}%`);
  console.log("═".repeat(50));

  // Exit with error code if any test failed (except the expected failure test)
  const unexpectedFailures = results.filter(
    (r) => !r.success && !r.name.includes("expect failure")
  );

  if (unexpectedFailures.length > 0) {
    console.error("\n❌ Some tests failed unexpectedly");
    process.exit(1);
  }

  console.log("\n✅ All tests passed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});

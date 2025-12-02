#!/usr/bin/env tsx
/**
 * Test script for Spectacles DAL (Data Access Layer)
 *
 * NOTE: This script only tests READ operations due to server-only restrictions.
 * For full CRUD testing, use Playwright E2E tests or API endpoint tests.
 *
 * Tests READ operations:
 * 1. Fetch all spectacles
 * 2. Fetch spectacle by ID (if any exist)
 * 3. Fetch spectacle by slug (if any exist)
 *
 * Run with: pnpm exec tsx scripts/test-spectacles-dal.ts
 */

import {
  fetchAllSpectacles,
  fetchSpectacleById,
  fetchSpectacleBySlug,
} from "../lib/dal/spectacles";

// Workaround for server-only package in Node.js scripts
process.env.NEXT_RUNTIME = "nodejs";

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  data?: unknown;
  error?: string;
}

async function runTest(
  name: string,
  testFn: () => Promise<unknown>
): Promise<TestResult> {
  const start = Date.now();
  try {
    const data = await testFn();
    return {
      name,
      success: true,
      duration: Date.now() - start,
      data,
    };
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("🧪 Testing Spectacles DAL (READ Operations Only)\n");
  console.log("=".repeat(60));
  console.log(
    "⚠️  Note: CREATE/UPDATE/DELETE require admin auth and API endpoints"
  );
  console.log("=".repeat(60) + "\n");

  const results: TestResult[] = [];

  // Test 1: Fetch all spectacles (public only)
  results.push(
    await runTest("Fetch all public spectacles", async () => {
      const spectacles = await fetchAllSpectacles();
      if (!Array.isArray(spectacles)) {
        throw new Error("Expected array of spectacles");
      }
      return {
        count: spectacles.length,
        sample: spectacles[0]
          ? {
              id: spectacles[0].id,
              title: spectacles[0].title,
              slug: spectacles[0].slug,
            }
          : null,
      };
    })
  );

  // Test 2: Fetch all spectacles (include private)
  results.push(
    await runTest("Fetch all spectacles (includePrivate)", async () => {
      const spectacles = await fetchAllSpectacles(true);
      if (!Array.isArray(spectacles)) {
        throw new Error("Expected array of spectacles");
      }
      return { count: spectacles.length };
    })
  );

  // Get first spectacle for testing (if any)
  const allSpectacles = await fetchAllSpectacles(true);
  const firstSpectacle = allSpectacles[0];

  // Test 3: Fetch spectacle by ID (if exists)
  if (firstSpectacle) {
    results.push(
      await runTest(
        `Fetch spectacle by ID (${firstSpectacle.id})`,
        async () => {
          const spectacle = await fetchSpectacleById(firstSpectacle.id);
          if (!spectacle) {
            throw new Error("Spectacle not found");
          }
          if (spectacle.id !== firstSpectacle.id) {
            throw new Error("ID mismatch");
          }
          return { id: spectacle.id, title: spectacle.title };
        }
      )
    );

    // Test 4: Fetch spectacle by slug (if has slug)
    if (firstSpectacle.slug) {
      results.push(
        await runTest(
          `Fetch spectacle by slug (${firstSpectacle.slug})`,
          async () => {
            const spectacle = await fetchSpectacleBySlug(firstSpectacle.slug!);
            if (!spectacle) {
              throw new Error("Spectacle not found by slug");
            }
            if (spectacle.slug !== firstSpectacle.slug) {
              throw new Error("Slug mismatch");
            }
            return { id: spectacle.id, slug: spectacle.slug };
          }
        )
      );
    }
  } else {
    console.log("⚠️  No spectacles in database - skipping ID/slug tests\n");
  }

  // Test 5: Error handling - non-existent ID
  results.push(
    await runTest("Fetch non-existent spectacle (ID 999999)", async () => {
      const spectacle = await fetchSpectacleById(999999);
      if (spectacle !== null) {
        throw new Error("Expected null for non-existent ID");
      }
      return { result: "null as expected" };
    })
  );

  // Test 6: Error handling - invalid slug
  results.push(
    await runTest("Fetch non-existent slug", async () => {
      const spectacle = await fetchSpectacleBySlug(
        "non-existent-slug-xyz-" + Date.now()
      );
      if (spectacle !== null) {
        throw new Error("Expected null for non-existent slug");
      }
      return { result: "null as expected" };
    })
  );

  // Print results
  console.log("\n📊 Test Results\n");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach((result, index) => {
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} Test ${index + 1}: ${result.name}`);
    console.log(`   Duration: ${result.duration}ms`);

    if (result.success && result.data) {
      console.log(`   Data: ${JSON.stringify(result.data)}`);
    }

    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }

    console.log();
  });

  console.log("=".repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total duration: ${totalDuration}ms`);
  console.log("=".repeat(60));

  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});

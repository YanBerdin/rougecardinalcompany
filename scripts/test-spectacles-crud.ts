#!/usr/bin/env tsx
/**
 * Test script for Spectacles CRUD operations
 *
 * Tests all CRUD operations directly via Supabase admin client
 * (bypasses server-only restriction for testing)
 *
 * Run with: pnpm exec tsx scripts/test-spectacles-crud.ts
 */
import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error("❌ Missing environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SECRET_KEY");
    process.exit(1);
}

// Create admin client (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
});

// ============================================================================
// Test Helpers
// ============================================================================

interface TestResult {
    name: string;
    success: boolean;
    duration: number;
    data?: unknown;
    error?: string;
}

const results: TestResult[] = [];

async function runTest(
    name: string,
    testFn: () => Promise<unknown>
): Promise<TestResult> {
    const start = Date.now();
    try {
        const data = await testFn();
        const duration = Date.now() - start;
        const result = { name, success: true, duration, data };
        results.push(result);
        console.log(`✅ ${name} (${duration}ms)`);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const result = { name, success: false, duration, error: errorMessage };
        results.push(result);
        console.log(`❌ ${name} (${duration}ms): ${errorMessage}`);
        return result;
    }
}

// ============================================================================
// CRUD Operations (direct Supabase calls)
// ============================================================================

async function fetchAllSpectacles(includePrivate = false) {
    let query = supabase
        .from("spectacles")
        .select("id, title, slug, public, status, genre")
        .order("created_at", { ascending: false });

    if (!includePrivate) {
        query = query.eq("public", true);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

async function fetchSpectacleById(id: number) {
    const { data, error } = await supabase
        .from("spectacles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data;
}

async function createSpectacle(input: {
    title: string;
    slug?: string;
    status?: string;
    genre?: string;
    public?: boolean;
}) {
    const slug =
        input.slug ||
        input.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

    const { data, error } = await supabase
        .from("spectacles")
        .insert({
            title: input.title,
            slug,
            status: input.status || "draft",
            genre: input.genre,
            public: input.public ?? false,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

async function updateSpectacle(
    id: number,
    updates: { title?: string; status?: string; public?: boolean }
) {
    const { data, error } = await supabase
        .from("spectacles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

async function deleteSpectacle(id: number) {
    const { error } = await supabase.from("spectacles").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
}

// ============================================================================
// Test Suite
// ============================================================================

async function main() {
    console.log("🧪 Testing Spectacles CRUD Operations\n");
    console.log("=".repeat(60));
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log("=".repeat(60) + "\n");

    let createdSpectacleId: number | null = null;
    const testTitle = `Test Spectacle ${Date.now()}`;
    const testSlug = `test-spectacle-${Date.now()}`;

    // -------------------------------------------------------------------------
    // Test 1: Fetch all spectacles (public only)
    // -------------------------------------------------------------------------
    await runTest("Fetch all public spectacles", async () => {
        const spectacles = await fetchAllSpectacles(false);
        if (!Array.isArray(spectacles)) {
            throw new Error("Expected array of spectacles");
        }
        return { count: spectacles.length };
    });

    // -------------------------------------------------------------------------
    // Test 2: Fetch all spectacles (include private)
    // -------------------------------------------------------------------------
    await runTest("Fetch all spectacles (includePrivate)", async () => {
        const spectacles = await fetchAllSpectacles(true);
        if (!Array.isArray(spectacles)) {
            throw new Error("Expected array of spectacles");
        }
        return { count: spectacles.length };
    });

    // -------------------------------------------------------------------------
    // Test 3: Create spectacle
    // -------------------------------------------------------------------------
    await runTest("Create new spectacle", async () => {
        const spectacle = await createSpectacle({
            title: testTitle,
            slug: testSlug,
            status: "draft",
            genre: "Test Genre",
            public: false,
        });

        if (!spectacle?.id) {
            throw new Error("Spectacle not created");
        }

        createdSpectacleId = spectacle.id;
        return { id: spectacle.id, title: spectacle.title, slug: spectacle.slug };
    });

    // -------------------------------------------------------------------------
    // Test 4: Fetch spectacle by ID
    // -------------------------------------------------------------------------
    await runTest("Fetch spectacle by ID", async () => {
        if (!createdSpectacleId) {
            throw new Error("No spectacle ID from create test");
        }

        const spectacle = await fetchSpectacleById(createdSpectacleId);
        if (!spectacle) {
            throw new Error("Spectacle not found");
        }

        if (spectacle.title !== testTitle) {
            throw new Error(`Title mismatch: ${spectacle.title} !== ${testTitle}`);
        }

        return { id: spectacle.id, title: spectacle.title };
    });

    // -------------------------------------------------------------------------
    // Test 5: Update spectacle
    // -------------------------------------------------------------------------
    await runTest("Update spectacle", async () => {
        if (!createdSpectacleId) {
            throw new Error("No spectacle ID from create test");
        }

        const updatedTitle = `${testTitle} (Updated)`;
        const spectacle = await updateSpectacle(createdSpectacleId, {
            title: updatedTitle,
            status: "published",
            public: true,
        });

        if (spectacle.title !== updatedTitle) {
            throw new Error(`Update failed: title is ${spectacle.title}`);
        }

        if (spectacle.public !== true) {
            throw new Error("Update failed: public should be true");
        }

        return { id: spectacle.id, title: spectacle.title, public: spectacle.public };
    });

    // -------------------------------------------------------------------------
    // Test 6: Verify update persisted
    // -------------------------------------------------------------------------
    await runTest("Verify update persisted", async () => {
        if (!createdSpectacleId) {
            throw new Error("No spectacle ID from create test");
        }

        const spectacle = await fetchSpectacleById(createdSpectacleId);
        if (!spectacle) {
            throw new Error("Spectacle not found after update");
        }

        if (!spectacle.public) {
            throw new Error("Public flag not persisted");
        }

        return { status: spectacle.status, public: spectacle.public };
    });

    // -------------------------------------------------------------------------
    // Test 7: Delete spectacle
    // -------------------------------------------------------------------------
    await runTest("Delete spectacle", async () => {
        if (!createdSpectacleId) {
            throw new Error("No spectacle ID from create test");
        }

        await deleteSpectacle(createdSpectacleId);
        return { deleted: createdSpectacleId };
    });

    // -------------------------------------------------------------------------
    // Test 8: Verify deletion
    // -------------------------------------------------------------------------
    await runTest("Verify deletion", async () => {
        if (!createdSpectacleId) {
            throw new Error("No spectacle ID from create test");
        }

        const spectacle = await fetchSpectacleById(createdSpectacleId);
        if (spectacle !== null) {
            throw new Error("Spectacle still exists after deletion");
        }

        return { verified: true };
    });

    // -------------------------------------------------------------------------
    // Test 9: Fetch non-existent spectacle
    // -------------------------------------------------------------------------
    await runTest("Fetch non-existent spectacle (ID 999999)", async () => {
        const spectacle = await fetchSpectacleById(999999);
        if (spectacle !== null) {
            throw new Error("Expected null for non-existent ID");
        }
        return { result: null };
    });

    // -------------------------------------------------------------------------
    // Results Summary
    // -------------------------------------------------------------------------
    console.log("\n" + "=".repeat(60));
    console.log("📊 Test Results Summary\n");

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total: ${results.length} tests`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${totalDuration}ms`);

    if (failed > 0) {
        console.log("\n❌ Failed tests:");
        results
            .filter((r) => !r.success)
            .forEach((r) => console.log(`   - ${r.name}: ${r.error}`));
        process.exit(1);
    }

    console.log("\n✅ All tests passed!");
}

main().catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
});

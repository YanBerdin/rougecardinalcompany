#!/usr/bin/env tsx
/**
 * Test Admin Compagnie Data Access Layer (TASK070)
 *
 * Validates the three DAL modules:
 * - admin-compagnie-values (compagnie_values)
 * - admin-compagnie-stats  (compagnie_stats)
 * - admin-compagnie-presentation (compagnie_presentation_sections)
 *
 * Usage: pnpm test:compagnie
 *
 * Requirements:
 * - SUPABASE_SECRET_KEY in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
    console.error("❌ Missing required environment variables:");
    console.error("   NEXT_PUBLIC_SUPABASE_URL");
    console.error("   SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey);

interface TestResult {
    test: string;
    passed: boolean;
    message: string;
}

const results: TestResult[] = [];

function pass(test: string, message: string): void {
    results.push({ test, passed: true, message });
    console.log(`✅ ${message}`);
}

function fail(test: string, message: string): void {
    results.push({ test, passed: false, message });
    console.error(`❌ ${message}`);
}

// ─── Compagnie Values ─────────────────────────────────────────────────────────

async function testCompagnieValues(): Promise<void> {
    console.log("\n── Compagnie Values ──────────────────────────────────");

    // Fetch all
    const { data: rows, error: fetchErr } = await supabase
        .from("compagnie_values")
        .select("id, key, title, description, position, active");

    if (fetchErr) {
        fail("values-fetch", `Fetch failed: ${fetchErr.message}`);
        return;
    }
    pass("values-fetch", `Fetched ${rows?.length ?? 0} compagnie_values row(s)`);

    // Create
    const newValue = {
        key: `test-value-${Date.now()}`,
        title: "Valeur test",
        description: "Description test",
        position: 99,
        active: false,
    };
    const { data: created, error: createErr } = await supabase
        .from("compagnie_values")
        .insert(newValue)
        .select("id, key, title")
        .single();

    if (createErr || !created) {
        fail("values-create", `Create failed: ${createErr?.message ?? "no data"}`);
        return;
    }
    pass("values-create", `Created value id=${created.id} key=${created.key}`);

    // Update
    const { error: updateErr } = await supabase
        .from("compagnie_values")
        .update({ title: "Valeur test modifiée" })
        .eq("id", created.id);

    if (updateErr) {
        fail("values-update", `Update failed: ${updateErr.message}`);
    } else {
        pass("values-update", `Updated value id=${created.id}`);
    }

    // Delete
    const { error: deleteErr } = await supabase
        .from("compagnie_values")
        .delete()
        .eq("id", created.id);

    if (deleteErr) {
        fail("values-delete", `Delete failed: ${deleteErr.message}`);
    } else {
        pass("values-delete", `Deleted value id=${created.id}`);
    }
}

// ─── Compagnie Stats ──────────────────────────────────────────────────────────

async function testCompagnieStats(): Promise<void> {
    console.log("\n── Compagnie Stats ───────────────────────────────────");

    const { data: rows, error: fetchErr } = await supabase
        .from("compagnie_stats")
        .select("id, key, label, value, position, active");

    if (fetchErr) {
        fail("stats-fetch", `Fetch failed: ${fetchErr.message}`);
        return;
    }
    pass("stats-fetch", `Fetched ${rows?.length ?? 0} compagnie_stats row(s)`);

    const newStat = {
        key: `test-stat-${Date.now()}`,
        label: "Stat test",
        value: "42",
        position: 99,
        active: false,
    };
    const { data: created, error: createErr } = await supabase
        .from("compagnie_stats")
        .insert(newStat)
        .select("id, key, label")
        .single();

    if (createErr || !created) {
        fail("stats-create", `Create failed: ${createErr?.message ?? "no data"}`);
        return;
    }
    pass("stats-create", `Created stat id=${created.id} key=${created.key}`);

    const { error: updateErr } = await supabase
        .from("compagnie_stats")
        .update({ value: "100" })
        .eq("id", created.id);

    if (updateErr) {
        fail("stats-update", `Update failed: ${updateErr.message}`);
    } else {
        pass("stats-update", `Updated stat id=${created.id}`);
    }

    const { error: deleteErr } = await supabase
        .from("compagnie_stats")
        .delete()
        .eq("id", created.id);

    if (deleteErr) {
        fail("stats-delete", `Delete failed: ${deleteErr.message}`);
    } else {
        pass("stats-delete", `Deleted stat id=${created.id}`);
    }
}

// ─── Compagnie Presentation ───────────────────────────────────────────────────

async function testCompagniePresentation(): Promise<void> {
    console.log("\n── Compagnie Presentation ────────────────────────────");

    const { data: rows, error: fetchErr } = await supabase
        .from("compagnie_presentation_sections")
        .select("id, slug, kind, title, position, active");

    if (fetchErr) {
        fail("presentation-fetch", `Fetch failed: ${fetchErr.message}`);
        return;
    }
    pass("presentation-fetch", `Fetched ${rows?.length ?? 0} section(s)`);

    const newSection = {
        slug: `test-section-${Date.now()}`,
        kind: "custom",
        title: "Section test",
        position: 99,
        active: false,
        content: ["Paragraphe test"],
    };
    const { data: created, error: createErr } = await supabase
        .from("compagnie_presentation_sections")
        .insert(newSection)
        .select("id, slug, kind")
        .single();

    if (createErr || !created) {
        fail("presentation-create", `Create failed: ${createErr?.message ?? "no data"}`);
        return;
    }
    pass("presentation-create", `Created section id=${created.id} slug=${created.slug}`);

    const { error: updateErr } = await supabase
        .from("compagnie_presentation_sections")
        .update({ title: "Section test modifiée" })
        .eq("id", created.id);

    if (updateErr) {
        fail("presentation-update", `Update failed: ${updateErr.message}`);
    } else {
        pass("presentation-update", `Updated section id=${created.id}`);
    }

    const { error: deleteErr } = await supabase
        .from("compagnie_presentation_sections")
        .delete()
        .eq("id", created.id);

    if (deleteErr) {
        fail("presentation-delete", `Delete failed: ${deleteErr.message}`);
    } else {
        pass("presentation-delete", `Deleted section id=${created.id}`);
    }
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runAll(): Promise<void> {
    console.log("🧪 Test Admin Compagnie DAL — TASK070\n");
    console.log(`URL: ${supabaseUrl}`);

    await testCompagnieValues();
    await testCompagnieStats();
    await testCompagniePresentation();

    console.log("\n═════════════════════════════════════════════════════");
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log(`Results: ${passed}/${total} passed`);

    if (failed > 0) {
        console.error(`\n❌ ${failed} test(s) FAILED:`);
        results
            .filter((r) => !r.passed)
            .forEach((r) => console.error(`  · [${r.test}] ${r.message}`));
        process.exit(1);
    }

    console.log("✅ All tests passed!");
}

runAll().catch((err: unknown) => {
    console.error("Fatal error:", err);
    process.exit(1);
});

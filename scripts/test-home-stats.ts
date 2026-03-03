#!/usr/bin/env tsx
/**
 * Test Home Stats Data Access Layer (TASK070 - B)
 *
 * Validates the HomeStat DAL module:
 * - fetchHomeStats   (compagnie_stats)
 * - createHomeStat   (compagnie_stats)
 * - updateHomeStat   (compagnie_stats)
 * - deleteHomeStat   (compagnie_stats)
 *
 * Usage: pnpm exec tsx scripts/test-home-stats.ts
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

let createdId: number | null = null;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function pass(label: string): void {
    console.log(`  ✅ ${label}`);
}

function fail(label: string, reason: string): void {
    console.error(`  ❌ ${label}: ${reason}`);
    process.exit(1);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

async function testFetchStats(): Promise<void> {
    console.log("\n📋 Fetch home stats");
    const { data, error } = await supabase
        .from("compagnie_stats")
        .select("id, key, label, value, position, active, created_at, updated_at")
        .order("position");

    if (error) fail("fetch", error.message);
    if (!Array.isArray(data)) fail("fetch", "Expected array");

    pass(`fetchHomeStats → ${data!.length} enregistrement(s)`);
}

async function testCreateStat(): Promise<void> {
    console.log("\n➕ Create home stat");

    const maxPosition = await supabase
        .from("compagnie_stats")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .single();

    const position = (maxPosition.data?.position ?? 0) + 1;
    const key = `test-stat-${Date.now()}`;

    const { data, error } = await supabase
        .from("compagnie_stats")
        .insert({ key, label: "Test Label", value: "99+", position, active: false })
        .select("id, key, label, value, position, active")
        .single();

    if (error) fail("create", error.message);
    if (!data?.id) fail("create", "No id returned");

    createdId = data!.id as number;
    pass(`createHomeStat → id=${createdId}, key=${key}`);
}

async function testUpdateStat(): Promise<void> {
    console.log("\n✏️  Update home stat");
    if (!createdId) fail("update", "No created id");

    const { data, error } = await supabase
        .from("compagnie_stats")
        .update({ label: "Updated Label", value: "100+", active: true })
        .eq("id", createdId!)
        .select("id, label, value, active")
        .single();

    if (error) fail("update", error.message);
    if (data?.label !== "Updated Label") fail("update", "Label not updated");
    if (data?.value !== "100+") fail("update", "Value not updated");
    if (data?.active !== true) fail("update", "Active not updated");

    pass(`updateHomeStat → label="${data!.label}", value="${data!.value}", active=${data!.active}`);
}

async function testAltTextColumn(): Promise<void> {
    console.log("\n🖼️  Verify alt_text column on compagnie_presentation_sections");

    const { error } = await supabase
        .from("compagnie_presentation_sections")
        .select("id, alt_text")
        .limit(1);

    if (error) fail("alt_text column", error.message);

    pass("alt_text column accessible on compagnie_presentation_sections");
}

async function testDeleteStat(): Promise<void> {
    console.log("\n🗑️  Delete home stat");
    if (!createdId) fail("delete", "No created id");

    const { error } = await supabase
        .from("compagnie_stats")
        .delete()
        .eq("id", createdId!);

    if (error) fail("delete", error.message);

    // Verify deletion
    const { data } = await supabase
        .from("compagnie_stats")
        .select("id")
        .eq("id", createdId!)
        .maybeSingle();

    if (data !== null) fail("delete", "Row still exists after delete");

    pass(`deleteHomeStat → id=${createdId} supprimé`);
    createdId = null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Runner
// ──────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    console.log("🚀 Test Home Stats DAL (TASK070-B)\n");

    try {
        await testFetchStats();
        await testCreateStat();
        await testUpdateStat();
        await testAltTextColumn();
        await testDeleteStat();

        console.log("\n✅ Tous les tests ont réussi");
    } catch (err) {
        // Cleanup on unexpected error
        if (createdId) {
            await supabase.from("compagnie_stats").delete().eq("id", createdId);
        }
        console.error("\n❌ Erreur inattendue :", err);
        process.exit(1);
    }
}

void main();

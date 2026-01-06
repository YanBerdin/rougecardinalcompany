#!/usr/bin/env tsx
/**
 * Test RLS Policy Validation - CLOUD VERSION
 * 
 * Tests that RLS policies with WITH CHECK clauses properly validate data
 * on the CLOUD database (not local).
 * 
 * Usage: pnpm exec tsx scripts/test-rls-cloud.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Validate required variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing environment variables:");
    console.error("  NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
    console.error("  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:", SUPABASE_KEY ? "✅" : "❌");
    process.exit(1);
}

// Use cloud credentials (not local)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
    try {
        await fn();
        results.push({ name, passed: true });
        console.log(`✅ ${name}`);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ name, passed: false, error: errorMessage });
        console.log(`❌ ${name}: ${errorMessage}`);
    }
}

async function runTests() {
    console.log("\n🧪 Testing RLS Policy WITH CHECK Validation (CLOUD)\n");
    console.log("=".repeat(60));

    // 1. NEWSLETTER TESTS
    console.log("\n1️⃣  Newsletter Subscription Tests");
    console.log("-".repeat(60));

    await test("1.1 Valid email accepted", async () => {
        const { error } = await supabase
            .from("abonnes_newsletter")
            .insert({ email: `test-${Date.now()}@example.com` });

        if (error) throw new Error(`Unexpected error: ${error.message}`);
    });

    await test("1.2 Invalid email blocked", async () => {
        const { error } = await supabase
            .from("abonnes_newsletter")
            .insert({ email: "not-an-email" });

        // Should be blocked with error code 23514 (check violation) or 42501 (policy)
        if (!error) {
            throw new Error("Invalid email was NOT blocked!");
        }
        if (!error.message.includes("new row violates") && error.code !== "42501") {
            throw new Error(`Wrong error type: ${error.code} - ${error.message}`);
        }
    });

    await test("1.3 Empty email blocked", async () => {
        const { error } = await supabase
            .from("abonnes_newsletter")
            .insert({ email: "" });

        if (!error) {
            throw new Error("Empty email was NOT blocked!");
        }
    });

    await test("1.4 Duplicate email blocked", async () => {
        const testEmail = `duplicate-test-${Date.now()}@example.com`;

        // First insert should succeed
        await supabase.from("abonnes_newsletter").insert({ email: testEmail });

        // Second insert should fail
        const { error } = await supabase
            .from("abonnes_newsletter")
            .insert({ email: testEmail });

        if (!error || error.code !== "23505") {
            throw new Error(`Expected duplicate key error, got: ${error?.code}`);
        }
    });

    // 2. CONTACT FORM TESTS
    console.log("\n2️⃣  Contact Form Tests");
    console.log("-".repeat(60));

    await test("2.1 Valid contact message accepted", async () => {
        const { error } = await supabase
            .from("messages_contact")
            .insert({
                firstname: "Test",
                lastname: "User",
                email: `test-${Date.now()}@example.com`,
                reason: "autre",
                message: "This is a valid test message that is long enough.",
                consent: true,  // Fixed: use 'consent' not 'consent_rgpd'
            });

        if (error) throw new Error(`Unexpected error: ${error.message}`);
    });

    await test("2.2 No RGPD consent blocked", async () => {
        const { error } = await supabase
            .from("messages_contact")
            .insert({
                firstname: "Test",
                lastname: "User",
                email: `test-${Date.now()}@example.com`,
                reason: "autre",
                message: "This is a test message that is long enough.",
                consent: false,  // Fixed: use 'consent' not 'consent_rgpd'
            });

        if (!error) {
            throw new Error("Message without consent was NOT blocked!");
        }
    });

    await test("2.3 Invalid email blocked", async () => {
        const { error } = await supabase
            .from("messages_contact")
            .insert({
                firstname: "Test",
                lastname: "User",
                email: "invalid-email",
                reason: "autre",
                message: "This is a test message that is long enough.",
                consent: true,
            });

        if (!error) {
            throw new Error("Invalid email was NOT blocked!");
        }
    });

    await test("2.4 Too short message blocked", async () => {
        const { error } = await supabase
            .from("messages_contact")
            .insert({
                firstname: "Test",
                lastname: "User",
                email: `test-${Date.now()}@example.com`,
                reason: "autre",
                message: "Too short",
                consent: true,
            });

        if (!error) {
            throw new Error("Too short message was NOT blocked!");
        }
    });

    await test("2.5 Invalid phone format blocked", async () => {
        const { error } = await supabase
            .from("messages_contact")
            .insert({
                firstname: "Test",
                lastname: "User",
                email: `test-${Date.now()}@example.com`,
                reason: "autre",
                phone: "123", // Fixed: use 'phone' not 'telephone'
                message: "This is a test message that is long enough.",
                consent: true,
            });

        if (!error) {
            throw new Error("Invalid phone was NOT blocked!");
        }
    });

    // 3. AUDIT LOGS TESTS
    console.log("\n3️⃣  Audit Logs Tests");
    console.log("-".repeat(60));

    await test("3.1 Direct INSERT blocked (CRITICAL)", async () => {
        const { error } = await supabase
            .from("logs_audit")
            .insert({
                table_name: "test_table",
                operation: "INSERT",
                old_data: null,
                new_data: { test: "data" },
            });

        // Accept both 42501 (RLS violation) and PGRST204 (GRANT revoked - table not accessible)
        // Both indicate the INSERT is properly blocked
        if (!error || (error.code !== "42501" && error.code !== "PGRST204")) {
            throw new Error(`Expected permission denied (42501 or PGRST204), got: ${error?.code}`);
        }
    });

    // 4. ANALYTICS TESTS
    console.log("\n4️⃣  Analytics Events Tests");
    console.log("-".repeat(60));

    await test("4.1 Valid analytics event accepted", async () => {
        const { error } = await supabase
            .from("analytics_events")
            .insert({
                event_type: "view",
                entity_type: "spectacle",
                entity_id: "123",
            });

        if (error) throw new Error(`Unexpected error: ${error.message}`);
    });

    await test("4.2 Invalid event_type blocked", async () => {
        const { error } = await supabase
            .from("analytics_events")
            .insert({
                event_type: "invalid_type",
                entity_type: "spectacle",
                entity_id: "123",
            });

        if (!error) {
            throw new Error("Invalid event_type was NOT blocked!");
        }
    });

    await test("4.3 Invalid entity_type blocked", async () => {
        const { error } = await supabase
            .from("analytics_events")
            .insert({
                event_type: "view",
                entity_type: "invalid_entity",
                entity_id: "123",
            });

        if (!error) {
            throw new Error("Invalid entity_type was NOT blocked!");
        }
    });

    // SUMMARY
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log(`Total tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
        console.log("\n❌ Failed tests:");
        results
            .filter((r) => !r.passed)
            .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));

        process.exit(1);
    } else {
        console.log("\n🎉 All tests passed!");
        process.exit(0);
    }
}

runTests().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

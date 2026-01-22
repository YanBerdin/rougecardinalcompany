#!/usr/bin/env tsx
/**
 * Script de test : Validation RLS policies WITH CHECK
 * 
 * Teste les 4 corrections de sécurité :
 * 1. abonnes_newsletter - Validation email + anti-duplicate
 * 2. messages_contact - Validation RGPD + champs requis
 * 3. logs_audit - INSERT restreint au trigger SECURITY DEFINER
 * 4. analytics_events - Validation types (event_type + entity_type whitelists)
 * 
 * Migration: 20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql
 * 
 * Usage:
 *   pnpm exec tsx scripts/test-rls-policy-with-check-validation.ts [--local]
 * 
 * Options:
 *   --local  Force local Supabase (127.0.0.1:54321) instead of cloud
 * 
 * Default: Uses cloud database from .env.local
 */
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
import { getLocalCredentials, validateLocalOnly } from "./utils/supabase-local-credentials";

const USE_LOCAL = process.argv.includes('--local');

let supabaseUrl: string;
let anonKey: string;

if (USE_LOCAL) {
    const { url, publishableKey } = getLocalCredentials({ silent: true });
    validateLocalOnly(url);
    supabaseUrl = url;
    anonKey = publishableKey;
} else {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
}

if (!supabaseUrl || !anonKey) {
    console.error("❌ Missing environment variables");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
    console.error("   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:", anonKey ? "✓" : "✗");
    process.exit(1);
}

const anonClient = createClient(supabaseUrl, anonKey);

interface TestResult {
    passed: number;
    failed: number;
    tests: Array<{
        name: string;
        status: "✅ PASS" | "❌ FAIL";
        details: string;
    }>;
}

const results: TestResult = {
    passed: 0,
    failed: 0,
    tests: [],
};

function recordTest(name: string, passed: boolean, details: string) {
    if (passed) {
        results.passed++;
        results.tests.push({ name, status: "✅ PASS", details });
    } else {
        results.failed++;
        results.tests.push({ name, status: "❌ FAIL", details });
    }
}

async function testNewsletterValidation() {
    console.log("\n🧪 Test 1: Newsletter email validation\n");

    // Test 1.1: Email invalide doit échouer
    const { error: invalidError } = await anonClient
        .from("abonnes_newsletter")
        .insert({ email: "invalid-email" });

    if (invalidError?.code === "42501" || invalidError?.code === "23514") {
        recordTest(
            "Newsletter - Invalid email blocked",
            true,
            `Policy enforced: ${invalidError.code} - ${invalidError.message}`
        );
        console.log("✅ Invalid email blocked (policy enforced)");
    } else {
        recordTest(
            "Newsletter - Invalid email blocked",
            false,
            `Expected 42501 or 23514, got: ${invalidError?.code} - ${invalidError?.message}`
        );
        console.log("❌ Invalid email NOT blocked:", invalidError);
    }

    // Test 1.2: Email vide doit échouer
    const { error: emptyError } = await anonClient
        .from("abonnes_newsletter")
        .insert({ email: "" });

    if (emptyError?.code === "42501" || emptyError?.code === "23514") {
        recordTest(
            "Newsletter - Empty email blocked",
            true,
            `Policy enforced: ${emptyError.code}`
        );
        console.log("✅ Empty email blocked (policy enforced)");
    } else {
        recordTest(
            "Newsletter - Empty email blocked",
            false,
            `Expected 42501 or 23514, got: ${emptyError?.code}`
        );
        console.log("❌ Empty email NOT blocked:", emptyError);
    }

    // Test 1.3: Email valide doit passer (ou détecter duplicate)
    const testEmail = `test-${Date.now()}@example.com`;
    const { error: validError } = await anonClient
        .from("abonnes_newsletter")
        .insert({ email: testEmail });

    if (!validError) {
        recordTest(
            "Newsletter - Valid email accepted",
            true,
            `Email accepted: ${testEmail}`
        );
        console.log("✅ Valid email accepted");

        // Cleanup
        await anonClient.from("abonnes_newsletter").delete().eq("email", testEmail);
    } else if (validError.code === "23505") {
        recordTest(
            "Newsletter - Valid email accepted",
            true,
            "Duplicate detected (expected if email exists)"
        );
        console.log("✅ Valid email accepted (or duplicate detected)");
    } else {
        recordTest(
            "Newsletter - Valid email accepted",
            false,
            `Expected success or 23505, got: ${validError.code} - ${validError.message}`
        );
        console.log("❌ Valid email rejected:", validError);
    }

    // Test 1.4: Test anti-duplicate (case-insensitive)
    const dupEmail = `duplicate-${Date.now()}@example.com`;
    await anonClient.from("abonnes_newsletter").insert({ email: dupEmail });

    const { error: dupError } = await anonClient
        .from("abonnes_newsletter")
        .insert({ email: dupEmail.toUpperCase() });

    if (dupError?.code === "42501" || dupError?.code === "23505") {
        recordTest(
            "Newsletter - Duplicate detection (case-insensitive)",
            true,
            `Duplicate blocked: ${dupError.code}`
        );
        console.log("✅ Duplicate email blocked (case-insensitive)");

        // Cleanup
        await anonClient.from("abonnes_newsletter").delete().eq("email", dupEmail);
    } else {
        recordTest(
            "Newsletter - Duplicate detection (case-insensitive)",
            false,
            `Expected 42501 or 23505, got: ${dupError?.code}`
        );
        console.log("❌ Duplicate email NOT blocked:", dupError);
    }
}

async function testContactValidation() {
    console.log("\n🧪 Test 2: Contact form validation\n");

    // Test 2.1: Consent manquant doit échouer
    const { error: noConsentError } = await anonClient
        .from("messages_contact")
        .insert({
            firstname: "Test",
            lastname: "User",
            email: "test@example.com",
            reason: "booking",
            message: "Test message with sufficient length",
            consent: false, // ❌ RGPD violation
        });

    if (noConsentError?.code === "42501" || noConsentError?.code === "23514") {
        recordTest(
            "Contact - No consent blocked",
            true,
            `RGPD enforced: ${noConsentError.code}`
        );
        console.log("✅ No consent blocked (RGPD enforced)");
    } else {
        recordTest(
            "Contact - No consent blocked",
            false,
            `Expected 42501 or 23514, got: ${noConsentError?.code}`
        );
        console.log("❌ No consent NOT blocked:", noConsentError);
    }

    // Test 2.2: Email invalide doit échouer
    const { error: invalidEmailError } = await anonClient
        .from("messages_contact")
        .insert({
            firstname: "Test",
            lastname: "User",
            email: "invalid-email",
            reason: "booking",
            message: "Test message with sufficient length",
            consent: true,
        });

    if (invalidEmailError?.code === "42501" || invalidEmailError?.code === "23514") {
        recordTest(
            "Contact - Invalid email blocked",
            true,
            `Policy enforced: ${invalidEmailError.code}`
        );
        console.log("✅ Invalid email blocked");
    } else {
        recordTest(
            "Contact - Invalid email blocked",
            false,
            `Expected 42501 or 23514, got: ${invalidEmailError?.code}`
        );
        console.log("❌ Invalid email NOT blocked:", invalidEmailError);
    }

    // Test 2.3: Message trop court doit échouer
    const { error: shortMessageError } = await anonClient
        .from("messages_contact")
        .insert({
            firstname: "Test",
            lastname: "User",
            email: "test@example.com",
            reason: "booking",
            message: "Short", // < 10 caractères
            consent: true,
        });

    if (shortMessageError?.code === "42501" || shortMessageError?.code === "23514") {
        recordTest(
            "Contact - Short message blocked",
            true,
            `Policy enforced: ${shortMessageError.code}`
        );
        console.log("✅ Short message blocked (< 10 chars)");
    } else {
        recordTest(
            "Contact - Short message blocked",
            false,
            `Expected 42501 or 23514, got: ${shortMessageError?.code}`
        );
        console.log("❌ Short message NOT blocked:", shortMessageError);
    }

    // Test 2.4: Téléphone invalide doit échouer
    const { error: invalidPhoneError } = await anonClient
        .from("messages_contact")
        .insert({
            firstname: "Test",
            lastname: "User",
            email: "test@example.com",
            reason: "booking",
            message: "Test message with sufficient length for validation",
            phone: "123", // Format invalide
            consent: true,
        });

    if (invalidPhoneError?.code === "42501" || invalidPhoneError?.code === "23514") {
        recordTest(
            "Contact - Invalid phone blocked",
            true,
            `Policy enforced: ${invalidPhoneError.code}`
        );
        console.log("✅ Invalid phone format blocked");
    } else {
        recordTest(
            "Contact - Invalid phone blocked",
            false,
            `Expected 42501 or 23514, got: ${invalidPhoneError?.code}`
        );
        console.log("❌ Invalid phone NOT blocked:", invalidPhoneError);
    }

    // Test 2.5: Champs valides doivent passer
    const { error: validError } = await anonClient
        .from("messages_contact")
        .insert({
            firstname: "Test",
            lastname: "User",
            email: "test@example.com",
            reason: "booking",
            message: "Valid test message with sufficient length for validation",
            consent: true,
        });

    if (!validError) {
        recordTest(
            "Contact - Valid form accepted",
            true,
            "Form submission successful"
        );
        console.log("✅ Valid contact form accepted");
    } else {
        recordTest(
            "Contact - Valid form accepted",
            false,
            `Expected success, got: ${validError.code} - ${validError.message}`
        );
        console.log("❌ Valid form rejected:", validError);
    }
}

async function testAuditLogsRestriction() {
    console.log("\n🧪 Test 3: Audit logs INSERT restriction\n");

    const { error } = await anonClient
        .from("logs_audit")
        .insert({
            user_id: "00000000-0000-0000-0000-000000000000",
            action: "INSERT",
            table_name: "fake_table",
            record_id: "fake_id",
        });

    if (error?.code === "42501") {
        recordTest(
            "Audit logs - Direct INSERT blocked",
            true,
            "Permission denied (system-only enforced)"
        );
        console.log("✅ Direct INSERT blocked (system-only enforced)");
    } else {
        recordTest(
            "Audit logs - Direct INSERT blocked",
            false,
            `Expected 42501, got: ${error?.code} - ${error?.message}`
        );
        console.log("❌ Direct INSERT allowed (SECURITY ISSUE):", error);
    }
}

async function testAnalyticsValidation() {
    console.log("\n🧪 Test 4: Analytics events validation\n");

    // Test 4.1: Event type invalide doit échouer
    const { error: invalidTypeError } = await anonClient
        .from("analytics_events")
        .insert({
            event_type: "invalid_type",
            entity_type: "spectacle",
            // Note: created_at uses default now()
        });

    if (invalidTypeError?.code === "42501" || invalidTypeError?.code === "23514") {
        recordTest(
            "Analytics - Invalid event type blocked",
            true,
            `Policy enforced: ${invalidTypeError.code}`
        );
        console.log("✅ Invalid event type blocked");
    } else {
        recordTest(
            "Analytics - Invalid event type blocked",
            false,
            `Expected 42501 or 23514, got: ${invalidTypeError?.code}`
        );
        console.log("❌ Invalid event type NOT blocked:", invalidTypeError);
    }

    // Test 4.2: Entity type invalide doit échouer
    const { error: invalidEntityError } = await anonClient
        .from("analytics_events")
        .insert({
            event_type: "view",
            entity_type: "invalid_entity",
            // Note: created_at uses default now()
        });

    if (invalidEntityError?.code === "42501" || invalidEntityError?.code === "23514") {
        recordTest(
            "Analytics - Invalid entity type blocked",
            true,
            `Policy enforced: ${invalidEntityError.code}`
        );
        console.log("✅ Invalid entity type blocked");
    } else {
        recordTest(
            "Analytics - Invalid entity type blocked",
            false,
            `Expected 42501 or 23514, got: ${invalidEntityError?.code}`
        );
        console.log("❌ Invalid entity type NOT blocked:", invalidEntityError);
    }

    // Test 4.3: Event valide doit passer
    const { error: validError } = await anonClient
        .from("analytics_events")
        .insert({
            event_type: "view",
            entity_type: "spectacle",
            // Note: created_at automatically set to now()
        });

    if (!validError) {
        recordTest(
            "Analytics - Valid event accepted",
            true,
            "Event recorded successfully"
        );
        console.log("✅ Valid analytics event accepted");
    } else {
        recordTest(
            "Analytics - Valid event accepted",
            false,
            `Expected success, got: ${validError.code} - ${validError.message}`
        );
        console.log("❌ Valid event rejected:", validError);
    }
}

async function runTests() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  RLS Policy WITH CHECK Validation Tests");
    console.log("  Migration: 20260106190617");
    console.log("═══════════════════════════════════════════════════════════");

    try {
        await testNewsletterValidation();
        await testContactValidation();
        await testAuditLogsRestriction();
        await testAnalyticsValidation();

        console.log("\n═══════════════════════════════════════════════════════════");
        console.log("  Test Results Summary");
        console.log("═══════════════════════════════════════════════════════════\n");

        results.tests.forEach((test) => {
            console.log(`${test.status} ${test.name}`);
            console.log(`   ${test.details}\n`);
        });

        console.log("───────────────────────────────────────────────────────────");
        console.log(`Total: ${results.passed + results.failed} tests`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log("═══════════════════════════════════════════════════════════\n");

        if (results.failed > 0) {
            console.error("❌ Some tests failed. Review RLS policies.");
            process.exit(1);
        } else {
            console.log("✅ All RLS policy validations passed!");
            process.exit(0);
        }
    } catch (error) {
        console.error("\n❌ Test execution failed:");
        console.error(error);
        process.exit(1);
    }
}

runTests();

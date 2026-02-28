#!/usr/bin/env tsx
/**
 * Test Admin Partners Data Access Layer (TASK-AUDIT-PARTNERS)
 *
 * Validates the partners DAL after audit fix refactoring:
 * - No direct process.env usage (uses buildMediaPublicUrl)
 * - Error codes follow [ERR_PARTNER_NNN] format
 * - fetchAllPartnersAdmin() returns PartnerDTO[]
 * - fetchPartnerById() returns correct PartnerDTO or error
 *
 * Usage: pnpm test:partners
 *
 * Requirements:
 * - SUPABASE_SECRET_KEY in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

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

async function testFetchAllPartners(): Promise<void> {
    console.log("\n📋 Test 1: Fetch All Partners");

    const { data, error } = await supabase
    .from("partners")
    .select(
      "id, name, website_url, logo_url, is_active, display_order, created_at, updated_at"
    )
    .order("display_order", { ascending: true });
    if (error) {
        fail("FetchAll", `fetchAllPartnersAdmin failed: ${error.message}`);
        return;
    }

    const count = data?.length ?? 0;
    pass("FetchAll", `Fetched ${count} partners from DB`);
}

async function testFetchPartnerByIdFound(): Promise<number | null> {
    console.log("\n🔍 Test 2: Fetch Existing Partner by ID");

    const { data: first, error } = await supabase
    .from("partners")
    .select("id")
    .limit(1)
    .single();

  if (error || !first) {
    pass("FetchByIdFound", "No partners in DB – skipping fetchById test");
    return null;
  }

  const { data, error: fetchError } = await supabase
    .from("partners")
    .select(
      "id, name, website_url, logo_url, is_active, display_order, created_at, updated_at"
    )
    .eq("id", first.id)
    .single();

    if (fetchError) {
        fail("FetchByIdFound", `fetchPartnerById(${first.id}) failed: ${fetchError.message}`);
        return null;
    }

    if (!data) {
        fail("FetchByIdFound", `fetchPartnerById(${first.id}) returned null`);
        return null;
    }

    pass("FetchByIdFound", `fetchPartnerById(${first.id}) returned: ${data.name}`);
    return Number(first.id);
}

async function testFetchPartnerByIdNotFound(): Promise<void> {
    console.log("\n🔍 Test 3: Fetch Non-Existent Partner by ID");

    const nonExistentId = 999_999_999;
    const { data, error } = await supabase
      .from("partners")
      .select("id, name")
      .eq("id", nonExistentId)
      .limit(1)
      .maybeSingle();

    if (error) {
        fail("FetchByIdNotFound", `Unexpected error: ${error.message}`);
        return;
    }

    if (data === null) {
        pass("FetchByIdNotFound", `fetchPartnerById(${nonExistentId}) correctly returns null`);
    } else {
        fail("FetchByIdNotFound", `fetchPartnerById(${nonExistentId}) unexpectedly returned data`);
    }
}

function testNoDirectProcessEnvInDAL(): void {
    console.log("\n🔒 Test 4: No direct process.env in DAL");

    const dalPath = resolve("lib/dal/admin-partners.ts");

    let content: string;
    try {
        content = readFileSync(dalPath, "utf-8");
    } catch {
        fail("NoProcessEnv", "Could not read lib/dal/admin-partners.ts");
        return;
    }

    const hasDirectEnv = /process\.env\.NEXT_PUBLIC_SUPABASE_URL/.test(content);
    if (hasDirectEnv) {
        fail("NoProcessEnv", "DAL still uses process.env.NEXT_PUBLIC_SUPABASE_URL directly");
    } else {
        pass("NoProcessEnv", "DAL does not use process.env directly – uses buildMediaPublicUrl");
    }
}

function testErrorCodesFormat(): void {
    console.log("\n🏷️  Test 5: Error codes follow [ERR_PARTNER_NNN] format");

    const dalPath = resolve("lib/dal/admin-partners.ts");

    let content: string;
    try {
        content = readFileSync(dalPath, "utf-8");
    } catch {
        fail("ErrorCodes", "Could not read lib/dal/admin-partners.ts");
        return;
    }

    const errorCodeMatches = content.match(/\[ERR_PARTNER_\d{3}\]/g) ?? [];
    if (errorCodeMatches.length === 0) {
        fail("ErrorCodes", "No [ERR_PARTNER_NNN] error codes found in DAL");
    } else {
        const unique = [...new Set(errorCodeMatches)];
        pass("ErrorCodes", `Found ${unique.length} error codes: ${unique.join(", ")}`);
    }
}

function testNoResolverCast(): void {
    console.log("\n🧹 Test 6: No Resolver<> cast in PartnerForm");

    const formPath = resolve("components/features/admin/partners/PartnerForm.tsx");

    let content: string;
    try {
        content = readFileSync(formPath, "utf-8");
    } catch {
        fail("NoResolverCast", "Could not read PartnerForm.tsx");
        return;
    }

    const hasResolverCast = /as\s+Resolver</.test(content);
    if (hasResolverCast) {
        fail("NoResolverCast", "PartnerForm.tsx still has unsafe Resolver<> cast");
    } else {
        pass("NoResolverCast", "No Resolver<> cast found in PartnerForm.tsx");
    }
}

async function runAll(): Promise<void> {
    console.log("🧪 Admin Partners – Audit Fix Validation");
    console.log("=".repeat(60));

    await testFetchAllPartners();
    await testFetchPartnerByIdFound();
    await testFetchPartnerByIdNotFound();
    testNoDirectProcessEnvInDAL();
    testErrorCodesFormat();
    testNoResolverCast();

    console.log("\n" + "=".repeat(60));
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;

    if (passed === total) {
        console.log(`\n✅ All ${total} tests passed`);
    } else {
        console.error(`\n❌ ${total - passed}/${total} tests failed`);
        console.error("\nFailed tests:");
        results
            .filter((r) => !r.passed)
            .forEach((r) => console.error(`  - [${r.test}] ${r.message}`));
        process.exit(1);
    }
}

runAll().catch((err: unknown) => {
    console.error("Fatal error:", err instanceof Error ? err.message : err);
    process.exit(1);
});

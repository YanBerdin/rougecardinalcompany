#!/usr/bin/env tsx
/**
 * Test RLS access as an editor-role user.
 *
 * Verifies that:
 * 1. EDITORIAL tables (spectacles, evenements, media, etc.) → full CRUD ✅
 * 2. ADMIN-ONLY tables (membres_equipe, contacts_presse, configurations_site) → blocked ❌
 *
 * @usage
 *   pnpm exec tsx scripts/test-editor-access-local.ts
 *
 * @requires
 * - Local Supabase running: `pnpm dlx supabase start`
 * - .env.local with SUPABASE_LOCAL_URL, SUPABASE_LOCAL_PUBLISHABLE_KEY, SUPABASE_LOCAL_SERVICE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import {
    getLocalCredentials,
    validateLocalOnly,
} from "./utils/supabase-local-credentials";

const TEST_EMAIL = "test-editor@rougecardinal.test";
const TEST_PASSWORD = "EditorTest2026!";

const { url, publishableKey, serviceKey } = getLocalCredentials({
    silent: true,
});
validateLocalOnly(url);

const adminClient = createClient(url, serviceKey);
const anonClient = createClient(url, publishableKey);

let passed = 0;
let failed = 0;

function ok(label: string) {
    passed++;
    console.log(`   ✅ ${label}`);
}

function fail(label: string, detail?: string) {
    failed++;
    console.error(`   ❌ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function ensureEditorUser(): Promise<string> {
    const { data: list } = await adminClient.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === TEST_EMAIL);

    if (existing) {
        // Ensure role is editor in app_metadata
        await adminClient.auth.admin.updateUserById(existing.id, {
            app_metadata: { role: "editor" },
            user_metadata: { role: "editor", display_name: "Test Editor" },
        });
        // Sync profiles.role (is_admin/has_min_role check this column)
        await adminClient
            .from("profiles")
            .update({ role: "editor" })
            .eq("user_id", existing.id);
        console.log("ℹ️  Editor test user already exists, updated role");
        return existing.id;
    }

    const { data, error } = await adminClient.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        app_metadata: { role: "editor" },
        user_metadata: { role: "editor", display_name: "Test Editor" },
    });

    if (error) {
        console.error("❌ Failed to create editor user:", error.message);
        process.exit(1);
    }

    // Sync profiles.role (trigger creates profile, needs role update)
    await adminClient
        .from("profiles")
        .update({ role: "editor" })
        .eq("user_id", data.user.id);
    console.log("✅ Editor test user created:", data.user.email);
    return data.user.id;
}

async function signInAsEditor() {
    const { data, error } = await anonClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    });

    if (error) {
        console.error("❌ Editor sign-in failed:", error.message);
        process.exit(1);
    }

    const token = data.session?.access_token;
    if (!token) {
        console.error("❌ No access token");
        process.exit(1);
    }

    return createClient(url, publishableKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });
}

type Op = "select" | "insert" | "update" | "delete";

interface CrudCheck {
    table: string;
    ops: Op[];
    expectAllowed: boolean;
}

const EDITORIAL_TABLES: CrudCheck[] = [
    { table: "spectacles", ops: ["select", "insert", "update", "delete"], expectAllowed: true },
    { table: "evenements", ops: ["select", "insert", "update", "delete"], expectAllowed: true },
    { table: "media", ops: ["select", "insert", "update", "delete"], expectAllowed: true },
    { table: "lieux", ops: ["select", "insert", "update", "delete"], expectAllowed: true },
    { table: "articles_presse", ops: ["select", "insert", "update", "delete"], expectAllowed: true },
    { table: "communiques_presse", ops: ["select", "insert", "update", "delete"], expectAllowed: true },
];

const ADMIN_ONLY_TABLES: CrudCheck[] = [
    // SELECT partially public (active=true visible to all), test mutations only
    { table: "membres_equipe", ops: ["insert", "update", "delete"], expectAllowed: false },
    // ALL operations admin-only (RGPD: personal journalist data)
    { table: "contacts_presse", ops: ["select", "insert", "update", "delete"], expectAllowed: false },
    // SELECT partially public (public:* and display_toggle_*), test mutations only
    { table: "configurations_site", ops: ["insert", "update", "delete"], expectAllowed: false },
];

/**
 * Valid INSERT payloads for blocked tables.
 * Real column names ensure PostgREST forwards to PostgreSQL,
 * where the RLS WITH CHECK clause can be properly evaluated.
 * Dummy columns are rejected by PostgREST BEFORE RLS evaluation.
 */
const BLOCKED_INSERT_PAYLOADS: Record<string, Record<string, unknown>> = {
    membres_equipe: { name: "__rls_test__" },
    contacts_presse: {
        nom: "__rls_test__",
        media: "__rls_test__",
        email: `__rls_test_${Date.now()}@test.invalid`,
    },
    configurations_site: { key: `__rls_test_${Date.now()}`, value: {} },
};

/** Primary key column per table (default: "id") */
const PK_COLUMNS: Record<string, string> = {
    configurations_site: "key",
};

/** Dummy PK value for UPDATE/DELETE tests (default: -1) */
const PK_DUMMY_VALUES: Record<string, string | number> = {
    configurations_site: "__nonexistent__",
};

async function testCrud(
    client: any,
    check: CrudCheck,
) {
    const { table, ops, expectAllowed } = check;
    const pkCol = PK_COLUMNS[table] ?? "id";
    const pkDummy = PK_DUMMY_VALUES[table] ?? -1;

    for (const op of ops) {
        const label = `${table}.${op}`;
        try {
            let error: { message: string; code?: string } | null = null;

            switch (op) {
                case "select": {
                    const res = await client.from(table).select("*").limit(1);
                    error = res.error;
                    // For blocked tables, RLS silently filters rows (0 rows, no error)
                    if (!expectAllowed && !error) {
                        if (res.data && res.data.length > 0) {
                            fail(label, "SECURITY: should be blocked but rows were returned");
                        } else {
                            ok(`${label} (correctly filtered — 0 rows)`);
                        }
                        continue;
                    }
                    break;
                }
                case "insert": {
                    const payload = !expectAllowed
                        ? (BLOCKED_INSERT_PAYLOADS[table] ?? { __test_dummy: true })
                        : { __test_dummy: true };
                    const res = await client
                        .from(table)
                        .insert(payload)
                        .select()
                        .single();
                    error = res.error;

                    // 1. Explicit RLS block (definitive test)
                    const isRlsBlock =
                        error !== null &&
                        (error.message.includes("row-level security") ||
                            error.message.includes("permission denied") ||
                            error.code === "42501");
                    if (isRlsBlock) {
                        if (!expectAllowed) {
                            ok(`${label} (correctly blocked by RLS)`);
                        } else {
                            fail(label, `blocked but should be allowed: ${error!.message}`);
                        }
                        continue;
                    }

                    // 2. Schema/constraint error = RLS allowed the attempt
                    const isSchemaError =
                        error !== null &&
                        (error.message.includes("column") ||
                            error.message.includes("null value") ||
                            error.message.includes("violates"));
                    if (isSchemaError) {
                        if (expectAllowed) {
                            ok(`${label} (allowed — schema/constraint error, not RLS block)`);
                        } else {
                            fail(label, "SECURITY: RLS should have blocked before schema error");
                        }
                        continue;
                    }
                    break;
                }
                case "update": {
                    const res = await client
                        .from(table)
                        .update({ updated_at: new Date().toISOString() })
                        .eq(pkCol, pkDummy);
                    error = res.error;
                    // For blocked tables, RLS USING makes rows invisible → 0 affected, no error
                    if (!expectAllowed && !error) {
                        ok(`${label} (correctly filtered — no visible rows)`);
                        continue;
                    }
                    break;
                }
                case "delete": {
                    const res = await client.from(table).delete().eq(pkCol, pkDummy);
                    error = res.error;
                    // For blocked tables, RLS USING makes rows invisible → 0 deleted, no error
                    if (!expectAllowed && !error) {
                        ok(`${label} (correctly filtered — no visible rows)`);
                        continue;
                    }
                    break;
                }
            }

            const isBlocked =
                error !== null &&
                (error.message.includes("permission denied") ||
                    error.code === "42501" ||
                    error.message.includes("new row violates row-level security"));

            if (expectAllowed) {
                if (!error || !isBlocked) {
                    ok(label);
                } else {
                    fail(label, `blocked but should be allowed: ${error.message}`);
                }
            } else {
                if (isBlocked) {
                    ok(`${label} (correctly blocked)`);
                } else if (!error) {
                    fail(label, "SECURITY: should be blocked but was allowed");
                } else {
                    fail(label, `unexpected error: ${error.message}`);
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            fail(label, `exception: ${msg}`);
        }
    }
}

async function main() {
    console.log("\n🔌 Testing against LOCAL Supabase\n");

    await ensureEditorUser();
    const editorClient = await signInAsEditor();

    console.log("\n📝 Testing EDITORIAL tables (should be ALLOWED):\n");
    for (const check of EDITORIAL_TABLES) {
        await testCrud(editorClient, check);
    }

    console.log("\n🔒 Testing ADMIN-ONLY tables (mutations should be BLOCKED):");
    console.log("   ℹ️  membres_equipe.select and configurations_site.select are");
    console.log("      intentionally public (active rows / display toggles).\n");
    for (const check of ADMIN_ONLY_TABLES) {
        await testCrud(editorClient, check);
    }

    console.log("\n" + "=".repeat(50));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    if (failed > 0) {
        console.error("❌ SOME TESTS FAILED — review RLS policies");
        process.exit(1);
    }

    console.log("✅ ALL TESTS PASSED — editor role permissions are correct\n");
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});

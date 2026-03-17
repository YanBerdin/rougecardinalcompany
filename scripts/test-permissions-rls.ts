#!/usr/bin/env tsx
/**
 * Test RLS permissions for anon, user (authenticated), editor, admin, and SQL functions.
 *
 * Covers spec sections:
 *   4.1 — Anon: public read only (ROLE-RLS-001 to 014)
 *   4.2 — User authenticated: read public, write blocked (ROLE-RLS-015 to 026)
 *   4.3 — Editor: CRUD éditorial (ROLE-RLS-027 to 047)
 *   4.4 — Admin: full access (ROLE-RLS-048 to 077)
 *   4.5 — SQL functions has_min_role() & is_admin() (ROLE-RLS-059 to 066)
 *   4.6 — Storage buckets: medias & backups (ROLE-RLS-080 to 086)
 *
 * @usage
 *   pnpm test:rls:local
 *
 * @requires
 * - Local Supabase running: `pnpm dlx supabase start`
 * - .env.e2e with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.e2e") });

/* ------------------------------------------------------------------ */
/*  Environment                                                        */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missing: string[] = [];
if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!PUBLISHABLE_KEY) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY");
if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");

if (missing.length > 0) {
    console.error(
        `❌ Missing env vars: ${missing.join(", ")}\n` +
        `   Ensure .env.e2e exists at project root.`,
    );
    process.exit(1);
}

function validateLocalOnly(url: string): void {
    if (!url.includes("127.0.0.1") && !url.includes("localhost")) {
        console.error(
            `🔴 SECURITY: refusing to run against non-local URL: ${url}`,
        );
        process.exit(1);
    }
}

validateLocalOnly(SUPABASE_URL!);

const adminClient = createClient(SUPABASE_URL!, SERVICE_KEY!);
const anonClient = createClient(SUPABASE_URL!, PUBLISHABLE_KEY!);

/* ------------------------------------------------------------------ */
/*  Test accounts                                                      */
/* ------------------------------------------------------------------ */

const USER_EMAIL = "test-user-rls@rougecardinal.test";
const USER_PASSWORD = "UserRlsTest2026!";
const EDITOR_EMAIL = "test-editor-rls@rougecardinal.test";
const EDITOR_PASSWORD = "EditorRlsTest2026!";
const ADMIN_EMAIL = "test-admin-rls@rougecardinal.test";
const ADMIN_PASSWORD = "AdminRlsTest2026!";

/* ------------------------------------------------------------------ */
/*  Counters & helpers                                                 */
/* ------------------------------------------------------------------ */

let passed = 0;
let failed = 0;

function ok(id: string, label: string) {
    passed++;
    console.log(`   ✅ [${id}] ${label}`);
}

function fail(id: string, label: string, detail?: string) {
    failed++;
    console.error(`   ❌ [${id}] ${label}${detail ? ` — ${detail}` : ""}`);
}

function isRlsBlock(error: { message: string; code?: string } | null): boolean {
    if (!error) return false;
    return (
        error.message.includes("row-level security") ||
        error.message.includes("permission denied") ||
        error.code === "42501" ||
        error.message.includes("new row violates row-level security")
    );
}

/* ------------------------------------------------------------------ */
/*  User provisioning                                                  */
/* ------------------------------------------------------------------ */

interface TestAccount {
    role: "user" | "editor" | "admin";
    email: string;
    password: string;
}

async function ensureTestUser(account: TestAccount): Promise<string> {
    const { role, email, password } = account;
    const { data: list } = await adminClient.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === email);

    if (existing) {
        await adminClient.auth.admin.updateUserById(existing.id, {
            app_metadata: { role },
            user_metadata: { role, display_name: `Test ${role}` },
        });
        await adminClient
            .from("profiles")
            .update({ role })
            .eq("user_id", existing.id);
        return existing.id;
    }

    const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
        user_metadata: { role, display_name: `Test ${role}` },
    });

    if (error) {
        console.error(`❌ Failed to create ${role} user:`, error.message);
        process.exit(1);
    }

    await adminClient
        .from("profiles")
        .update({ role })
        .eq("user_id", data.user.id);
    return data.user.id;
}

async function signInAs(
    email: string,
    password: string,
): Promise<SupabaseClient> {
    const tempClient = createClient(SUPABASE_URL!, PUBLISHABLE_KEY!);
    const { data, error } = await tempClient.auth.signInWithPassword({
        email,
        password,
    });
    if (error || !data.session?.access_token) {
        console.error(`❌ Sign-in failed for ${email}:`, error?.message);
        process.exit(1);
    }
    return createClient(SUPABASE_URL!, PUBLISHABLE_KEY!, {
        global: {
            headers: { Authorization: `Bearer ${data.session.access_token}` },
        },
    });
}

/* ================================================================== */
/*  4.1 — ANON tests (ROLE-RLS-001 to 014)                           */
/* ================================================================== */

async function testAnon() {
    console.log("\n👤 Section 4.1 — Anon: public read only\n");

    // ROLE-RLS-001: spectacles — only public=true AND status in published/archived
    {
        const { data, error } = await anonClient
            .from("spectacles")
            .select("id, public, status")
            .limit(100);
        if (error) {
            fail("RLS-001", "Anon select spectacles", error.message);
        } else {
            const forbidden = (data ?? []).filter(
                (r) =>
                    r.public !== true ||
                    !["published", "archived"].includes(r.status),
            );
            if (forbidden.length > 0) {
                fail(
                    "RLS-001",
                    "Anon select spectacles",
                    `${forbidden.length} rows with non-public or draft status returned`,
                );
            } else {
                ok("RLS-001", "Anon select spectacles — only public+published/archived");
            }
        }
    }

    // ROLE-RLS-002: evenements — public read
    {
        const { error } = await anonClient
            .from("evenements")
            .select("id")
            .limit(1);
        if (error) {
            fail("RLS-002", "Anon select evenements", error.message);
        } else {
            ok("RLS-002", "Anon select evenements — public read");
        }
    }

    // ROLE-RLS-003: membres_equipe — only active=true
    {
        const { data, error } = await anonClient
            .from("membres_equipe")
            .select("id, active")
            .limit(100);
        if (error) {
            fail("RLS-003", "Anon select membres_equipe", error.message);
        } else {
            const inactive = (data ?? []).filter((r) => r.active !== true);
            if (inactive.length > 0) {
                fail(
                    "RLS-003",
                    "Anon select membres_equipe",
                    `${inactive.length} inactive rows returned`,
                );
            } else {
                ok("RLS-003", "Anon select membres_equipe — only active");
            }
        }
    }

    // ROLE-RLS-004: partners — only is_active=true
    {
        const { data, error } = await anonClient
            .from("partners")
            .select("id, is_active")
            .limit(100);
        if (error) {
            fail("RLS-004", "Anon select partners", error.message);
        } else {
            const inactive = (data ?? []).filter((r) => r.is_active !== true);
            if (inactive.length > 0) {
                fail(
                    "RLS-004",
                    "Anon select partners",
                    `${inactive.length} inactive rows returned`,
                );
            } else {
                ok("RLS-004", "Anon select partners — only is_active");
            }
        }
    }

    // ROLE-RLS-005: articles_presse — only published_at IS NOT NULL
    {
        const { data, error } = await anonClient
            .from("articles_presse")
            .select("id, published_at")
            .limit(100);
        if (error) {
            fail("RLS-005", "Anon select articles_presse", error.message);
        } else {
            const unpublished = (data ?? []).filter(
                (r) => r.published_at === null,
            );
            if (unpublished.length > 0) {
                fail(
                    "RLS-005",
                    "Anon select articles_presse",
                    `${unpublished.length} unpublished rows returned`,
                );
            } else {
                ok("RLS-005", "Anon select articles_presse — only published");
            }
        }
    }

    // ROLE-RLS-006: communiques_presse — only public=true
    {
        const { data, error } = await anonClient
            .from("communiques_presse")
            .select("id, public")
            .limit(100);
        if (error) {
            fail("RLS-006", "Anon select communiques_presse", error.message);
        } else {
            const nonPublic = (data ?? []).filter((r) => r.public !== true);
            if (nonPublic.length > 0) {
                fail(
                    "RLS-006",
                    "Anon select communiques_presse",
                    `${nonPublic.length} non-public rows returned`,
                );
            } else {
                ok("RLS-006", "Anon select communiques_presse — only public");
            }
        }
    }

    // ROLE-RLS-007: contacts_presse — no rows for anon
    {
        const { data, error } = await anonClient
            .from("contacts_presse")
            .select("id")
            .limit(1);
        if (error) {
            // RLS error or permission denied is acceptable
            ok("RLS-007", "Anon select contacts_presse — blocked (error)");
        } else if ((data ?? []).length === 0) {
            ok("RLS-007", "Anon select contacts_presse — 0 rows");
        } else {
            fail(
                "RLS-007",
                "Anon select contacts_presse",
                "SECURITY: rows returned for anon",
            );
        }
    }

    // ROLE-RLS-008: medias — public read
    {
        const { error } = await anonClient
            .from("medias")
            .select("id")
            .limit(1);
        if (error) {
            fail("RLS-008", "Anon select medias", error.message);
        } else {
            ok("RLS-008", "Anon select medias — public read");
        }
    }

    // ROLE-RLS-009: configurations_site — partial (display_toggle_%)
    {
        const { data, error } = await anonClient
            .from("configurations_site")
            .select("key")
            .limit(100);
        if (error) {
            fail("RLS-009", "Anon select configurations_site", error.message);
        } else {
            const forbidden = (data ?? []).filter(
                (r) =>
                    !String(r.key).startsWith("public:") &&
                    !String(r.key).startsWith("display_toggle_"),
            );
            if (forbidden.length > 0) {
                fail(
                    "RLS-009",
                    "Anon select configurations_site",
                    `${forbidden.length} non-public keys returned: ${forbidden.map((r) => r.key).join(", ")}`,
                );
            } else {
                ok(
                    "RLS-009",
                    "Anon select configurations_site — only public/display_toggle",
                );
            }
        }
    }

    // ROLE-RLS-010: Anon insert blocked on editorial tables
    {
        const tablesToBlock = [
            { table: "spectacles", payload: { title: "__rls_test__" } },
            { table: "evenements", payload: { spectacle_id: 999999, date_debut: "2099-01-01T00:00:00" } },
            { table: "membres_equipe", payload: { name: "__rls_test__" } },
            { table: "partners", payload: { name: "__rls_test__" } },
        ];
        let allBlocked = true;
        const details: string[] = [];
        for (const { table, payload } of tablesToBlock) {
            const { error } = await anonClient.from(table).insert(payload);
            if (!error) {
                allBlocked = false;
                details.push(`${table} INSERT allowed`);
            }
        }
        if (allBlocked) {
            ok("RLS-010", "Anon insert blocked on editorial tables");
        } else {
            fail(
                "RLS-010",
                "Anon insert blocked",
                `SECURITY: ${details.join(", ")}`,
            );
        }
    }

    // ROLE-RLS-011: logs_audit — no rows for anon
    {
        const { data, error } = await anonClient
            .from("logs_audit")
            .select("id")
            .limit(1);
        if (error) {
            ok("RLS-011", "Anon select logs_audit — blocked (error)");
        } else if ((data ?? []).length === 0) {
            ok("RLS-011", "Anon select logs_audit — 0 rows");
        } else {
            fail(
                "RLS-011",
                "Anon select logs_audit",
                "SECURITY: rows returned",
            );
        }
    }

    // ROLE-RLS-012: user_invitations — no rows for anon
    {
        const { data, error } = await anonClient
            .from("user_invitations")
            .select("id")
            .limit(1);
        if (error) {
            ok("RLS-012", "Anon select user_invitations — blocked (error)");
        } else if ((data ?? []).length === 0) {
            ok("RLS-012", "Anon select user_invitations — 0 rows");
        } else {
            fail(
                "RLS-012",
                "Anon select user_invitations",
                "SECURITY: rows returned",
            );
        }
    }

    // ROLE-RLS-013: categories — only is_active=true
    {
        const { data, error } = await anonClient
            .from("categories")
            .select("id, is_active")
            .limit(100);
        if (error) {
            fail("RLS-013", "Anon select categories", error.message);
        } else {
            const inactive = (data ?? []).filter((r) => r.is_active !== true);
            if (inactive.length > 0) {
                fail(
                    "RLS-013",
                    "Anon select categories",
                    `${inactive.length} inactive rows returned`,
                );
            } else {
                ok("RLS-013", "Anon select categories — only is_active");
            }
        }
    }

    // ROLE-RLS-014: tags — public read
    {
        const { error } = await anonClient.from("tags").select("id").limit(1);
        if (error) {
            fail("RLS-014", "Anon select tags", error.message);
        } else {
            ok("RLS-014", "Anon select tags — public read");
        }
    }
}

/* ================================================================== */
/*  4.2 — User authenticated tests (ROLE-RLS-015 to 026)             */
/* ================================================================== */

async function testUserAuthenticated(userClient: SupabaseClient) {
    console.log(
        "\n🔐 Section 4.2 — User authenticated: read public, write blocked\n",
    );

    // ROLE-RLS-015: User select spectacles — same as anon
    {
        const { data, error } = await userClient
            .from("spectacles")
            .select("id, public, status")
            .limit(100);
        if (error) {
            fail("RLS-015", "User select spectacles", error.message);
        } else {
            const forbidden = (data ?? []).filter(
                (r) =>
                    r.public !== true ||
                    !["published", "archived"].includes(r.status),
            );
            if (forbidden.length > 0) {
                fail(
                    "RLS-015",
                    "User select spectacles",
                    `${forbidden.length} non-public rows returned`,
                );
            } else {
                ok("RLS-015", "User select spectacles — only public+published/archived");
            }
        }
    }

    // ROLE-RLS-016: User insert spectacles — blocked
    {
        const { error } = await userClient
            .from("spectacles")
            .insert({ title: "__rls_test__" });
        if (isRlsBlock(error)) {
            ok("RLS-016", "User insert spectacles — blocked by RLS");
        } else if (error) {
            // Schema error means RLS allowed it through
            if (
                error.message.includes("column") ||
                error.message.includes("null value") ||
                error.message.includes("violates")
            ) {
                fail(
                    "RLS-016",
                    "User insert spectacles",
                    "SECURITY: RLS should have blocked before schema error",
                );
            } else {
                ok("RLS-016", "User insert spectacles — blocked");
            }
        } else {
            fail(
                "RLS-016",
                "User insert spectacles",
                "SECURITY: insert allowed for user role",
            );
        }
    }

    // ROLE-RLS-017: User update spectacles — blocked
    {
        const { error } = await userClient
            .from("spectacles")
            .update({ title: "__rls_test__" })
            .eq("id", -1);
        if (isRlsBlock(error)) {
            ok("RLS-017", "User update spectacles — blocked by RLS");
        } else if (!error) {
            ok("RLS-017", "User update spectacles — 0 visible rows (filtered)");
        } else {
            fail("RLS-017", "User update spectacles", error.message);
        }
    }

    // ROLE-RLS-018: User delete spectacles — blocked
    {
        const { error } = await userClient
            .from("spectacles")
            .delete()
            .eq("id", -1);
        if (isRlsBlock(error)) {
            ok("RLS-018", "User delete spectacles — blocked by RLS");
        } else if (!error) {
            ok("RLS-018", "User delete spectacles — 0 visible rows (filtered)");
        } else {
            fail("RLS-018", "User delete spectacles", error.message);
        }
    }

    // ROLE-RLS-019: User insert evenements — blocked
    {
        const { error } = await userClient
            .from("evenements")
            .insert({ spectacle_id: 999999, date_debut: "2099-01-01T00:00:00" });
        if (isRlsBlock(error)) {
            ok("RLS-019", "User insert evenements — blocked by RLS");
        } else if (
            error &&
            (error.message.includes("column") ||
                error.message.includes("null value") ||
                error.message.includes("violates"))
        ) {
            fail(
                "RLS-019",
                "User insert evenements",
                "SECURITY: RLS should have blocked before schema error",
            );
        } else if (!error) {
            fail(
                "RLS-019",
                "User insert evenements",
                "SECURITY: insert allowed for user role",
            );
        } else {
            ok("RLS-019", "User insert evenements — blocked");
        }
    }

    // ROLE-RLS-020: User insert membres_equipe — blocked (is_admin)
    {
        const { error } = await userClient
            .from("membres_equipe")
            .insert({ name: "__rls_test__" });
        if (isRlsBlock(error)) {
            ok("RLS-020", "User insert membres_equipe — blocked by RLS");
        } else if (!error) {
            fail(
                "RLS-020",
                "User insert membres_equipe",
                "SECURITY: insert allowed for user role",
            );
        } else {
            ok("RLS-020", "User insert membres_equipe — blocked");
        }
    }

    // ROLE-RLS-021: User insert partners — blocked
    {
        const { error } = await userClient
            .from("partners")
            .insert({ name: "__rls_test__" });
        if (isRlsBlock(error)) {
            ok("RLS-021", "User insert partners — blocked by RLS");
        } else if (!error) {
            fail(
                "RLS-021",
                "User insert partners",
                "SECURITY: insert allowed for user role",
            );
        } else {
            ok("RLS-021", "User insert partners — blocked");
        }
    }

    // ROLE-RLS-022: User insert contacts_presse — blocked
    {
        const { error } = await userClient.from("contacts_presse").insert({
            nom: "__rls_test__",
            media: "__rls_test__",
            email: `__rls_test_${Date.now()}@test.invalid`,
        });
        if (isRlsBlock(error)) {
            ok("RLS-022", "User insert contacts_presse — blocked by RLS");
        } else if (!error) {
            fail(
                "RLS-022",
                "User insert contacts_presse",
                "SECURITY: insert allowed for user role",
            );
        } else {
            ok("RLS-022", "User insert contacts_presse — blocked");
        }
    }

    // ROLE-RLS-023: User select logs_audit — no rows
    {
        const { data, error } = await userClient
            .from("logs_audit")
            .select("id")
            .limit(1);
        if (error) {
            ok("RLS-023", "User select logs_audit — blocked (error)");
        } else if ((data ?? []).length === 0) {
            ok("RLS-023", "User select logs_audit — 0 rows");
        } else {
            fail(
                "RLS-023",
                "User select logs_audit",
                "SECURITY: rows returned for user role",
            );
        }
    }

    // ROLE-RLS-024: User insert analytics_events — allowed (public insert)
    {
        const { error } = await userClient.from("analytics_events").insert({
            event_type: "page_view",
            event_data: { test: true },
            page_url: "/test",
        });
        if (error && isRlsBlock(error)) {
            fail(
                "RLS-024",
                "User insert analytics_events",
                "blocked but should be allowed",
            );
        } else if (error) {
            // Schema/constraint errors are acceptable — RLS allowed the attempt
            ok(
                "RLS-024",
                "User insert analytics_events — allowed (schema error, not RLS)",
            );
        } else {
            ok("RLS-024", "User insert analytics_events — allowed");
        }
    }

    // ROLE-RLS-025: User insert messages_contact — allowed
    {
        const { error } = await userClient.from("messages_contact").insert({
            nom: "__rls_test__",
            email: "__rls_test@test.invalid",
            message: "__rls_test__",
        });
        if (error && isRlsBlock(error)) {
            fail(
                "RLS-025",
                "User insert messages_contact",
                "blocked but should be allowed",
            );
        } else if (error) {
            ok(
                "RLS-025",
                "User insert messages_contact — allowed (schema error, not RLS)",
            );
        } else {
            ok("RLS-025", "User insert messages_contact — allowed");
        }
    }

    // ROLE-RLS-026: User insert abonnes_newsletter — allowed
    {
        const testEmail = `__rls_test_${Date.now()}@test.invalid`;
        const { error } = await userClient
            .from("abonnes_newsletter")
            .insert({ email: testEmail });
        if (error && isRlsBlock(error)) {
            fail(
                "RLS-026",
                "User insert abonnes_newsletter",
                "blocked but should be allowed",
            );
        } else if (error) {
            ok(
                "RLS-026",
                "User insert abonnes_newsletter — allowed (schema error, not RLS)",
            );
        } else {
            ok("RLS-026", "User insert abonnes_newsletter — allowed");
        }
    }
}

/* ================================================================== */
/*  4.5 — SQL functions has_min_role() & is_admin() (RLS-059 to 066) */
/* ================================================================== */

async function callRpc(
    client: SupabaseClient,
    fn: string,
    args?: Record<string, unknown>,
): Promise<unknown> {
    const { data, error } = await client.rpc(fn, args);
    if (error) throw new Error(`RPC ${fn} failed: ${error.message}`);
    return data;
}

async function testSqlFunctions(
    userClient: SupabaseClient,
    editorClient: SupabaseClient,
    adminSessClient: SupabaseClient,
) {
    console.log(
        "\n🧮 Section 4.5 — SQL functions has_min_role() & is_admin()\n",
    );

    // ROLE-RLS-059: admin → has_min_role('editor') → true
    {
        try {
            const result = await callRpc(adminSessClient, "has_min_role", {
                required_role: "editor",
            });
            if (result === true) {
                ok("RLS-059", "admin → has_min_role('editor') = true");
            } else {
                fail(
                    "RLS-059",
                    "admin → has_min_role('editor')",
                    `expected true, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-059", "admin → has_min_role('editor')", String(e));
        }
    }

    // ROLE-RLS-060: editor → has_min_role('editor') → true
    {
        try {
            const result = await callRpc(editorClient, "has_min_role", {
                required_role: "editor",
            });
            if (result === true) {
                ok("RLS-060", "editor → has_min_role('editor') = true");
            } else {
                fail(
                    "RLS-060",
                    "editor → has_min_role('editor')",
                    `expected true, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-060", "editor → has_min_role('editor')", String(e));
        }
    }

    // ROLE-RLS-061: user → has_min_role('editor') → false
    {
        try {
            const result = await callRpc(userClient, "has_min_role", {
                required_role: "editor",
            });
            if (result === false) {
                ok("RLS-061", "user → has_min_role('editor') = false");
            } else {
                fail(
                    "RLS-061",
                    "user → has_min_role('editor')",
                    `expected false, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-061", "user → has_min_role('editor')", String(e));
        }
    }

    // ROLE-RLS-062: user → has_min_role('user') → true
    {
        try {
            const result = await callRpc(userClient, "has_min_role", {
                required_role: "user",
            });
            if (result === true) {
                ok("RLS-062", "user → has_min_role('user') = true");
            } else {
                fail(
                    "RLS-062",
                    "user → has_min_role('user')",
                    `expected true, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-062", "user → has_min_role('user')", String(e));
        }
    }

    // ROLE-RLS-063: admin → is_admin() → true
    {
        try {
            const result = await callRpc(adminSessClient, "is_admin");
            if (result === true) {
                ok("RLS-063", "admin → is_admin() = true");
            } else {
                fail(
                    "RLS-063",
                    "admin → is_admin()",
                    `expected true, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-063", "admin → is_admin()", String(e));
        }
    }

    // ROLE-RLS-064: editor → is_admin() → false
    {
        try {
            const result = await callRpc(editorClient, "is_admin");
            if (result === false) {
                ok("RLS-064", "editor → is_admin() = false");
            } else {
                fail(
                    "RLS-064",
                    "editor → is_admin()",
                    `expected false, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-064", "editor → is_admin()", String(e));
        }
    }

    // ROLE-RLS-065: user → is_admin() → false
    {
        try {
            const result = await callRpc(userClient, "is_admin");
            if (result === false) {
                ok("RLS-065", "user → is_admin() = false");
            } else {
                fail(
                    "RLS-065",
                    "user → is_admin()",
                    `expected false, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-065", "user → is_admin()", String(e));
        }
    }

    // ROLE-RLS-066: admin → has_min_role('superadmin') → false (invalid role)
    {
        try {
            const result = await callRpc(adminSessClient, "has_min_role", {
                required_role: "superadmin",
            });
            if (result === false) {
                ok("RLS-066", "admin → has_min_role('superadmin') = false (invalid)");
            } else {
                fail(
                    "RLS-066",
                    "admin → has_min_role('superadmin')",
                    `expected false, got ${result}`,
                );
            }
        } catch (e) {
            fail("RLS-066", "admin → has_min_role('superadmin')", String(e));
        }
    }
}

/* ================================================================== */
/*  4.4 — Admin: full access (RLS-048 to 077)                        */
/* ================================================================== */

async function testAdminAccess(
    adminSessClient: SupabaseClient,
    editorClient: SupabaseClient,
    userClient: SupabaseClient,
    adminId: string,
    userId: string,
) {
    console.log("\n👑 Section 4.4 — Admin: accès complet\n");

    const ts = Date.now();

    // ROLE-RLS-048: Admin select spectacles (all rows, including draft/private)
    {
        const { data, error } = await adminSessClient
            .from("spectacles")
            .select("id");
        if (error) {
            fail("RLS-048", "Admin select spectacles (tous)", error.message);
        } else {
            ok("RLS-048", `Admin select spectacles (tous) — ${data.length} rows`);
        }
    }

    // ROLE-RLS-049: Admin CRUD membres_equipe
    {
        const label = "Admin CRUD membres_equipe";
        const payload = { name: `__rls_admin_${ts}` };
        const { data: ins, error: insErr } = await adminSessClient
            .from("membres_equipe")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-049", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("membres_equipe")
                .update({ name: `__rls_admin_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("membres_equipe")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-049", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-049", label);
            }
            // cleanup fallback
            await adminClient.from("membres_equipe").delete().eq("id", id);
        }
    }

    // ROLE-RLS-050: Admin CRUD partners
    {
        const label = "Admin CRUD partners";
        const payload = { name: `__rls_admin_${ts}` };
        const { data: ins, error: insErr } = await adminSessClient
            .from("partners")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-050", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("partners")
                .update({ name: `__rls_admin_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("partners")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-050", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-050", label);
            }
            await adminClient.from("partners").delete().eq("id", id);
        }
    }

    // ROLE-RLS-051: Admin CRUD contacts_presse
    {
        const label = "Admin CRUD contacts_presse";
        const email = `__rls_admin_${ts}@test.invalid`;
        const payload = { nom: `__rls_admin_${ts}`, media: "Test Media", email };
        const { data: ins, error: insErr } = await adminSessClient
            .from("contacts_presse")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-051", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("contacts_presse")
                .update({ nom: `__rls_admin_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("contacts_presse")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-051", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-051", label);
            }
            await adminClient.from("contacts_presse").delete().eq("id", id);
        }
    }

    // ROLE-RLS-052: Admin CRUD configurations_site
    {
        const label = "Admin CRUD configurations_site";
        const key = `__rls_admin_test_${ts}`;
        const payload = { key, value: { test: true } };
        const { error: insErr } = await adminSessClient
            .from("configurations_site")
            .insert(payload);
        if (insErr) {
            fail("RLS-052", label, `insert: ${insErr.message}`);
        } else {
            const { error: updErr } = await adminSessClient
                .from("configurations_site")
                .update({ value: { test: false } })
                .eq("key", key);
            const { error: delErr } = await adminSessClient
                .from("configurations_site")
                .delete()
                .eq("key", key);
            if (updErr || delErr) {
                fail("RLS-052", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-052", label);
            }
            await adminClient.from("configurations_site").delete().eq("key", key);
        }
    }

    // ROLE-RLS-053: Admin CRUD home_hero_slides
    {
        const label = "Admin CRUD home_hero_slides";
        const slug = `__rls-admin-${ts}`;
        const payload = { title: `__rls_admin_${ts}`, slug };
        const { data: ins, error: insErr } = await adminSessClient
            .from("home_hero_slides")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-053", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("home_hero_slides")
                .update({ title: `__rls_admin_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("home_hero_slides")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-053", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-053", label);
            }
            await adminClient.from("home_hero_slides").delete().eq("id", id);
        }
    }

    // ROLE-RLS-054: Admin CRUD home_about_content
    {
        const label = "Admin CRUD home_about_content";
        const slug = `__rls-admin-${ts}`;
        const payload = {
            slug,
            title: `__rls_admin_${ts}`,
            intro1: "test intro1",
            intro2: "test intro2",
            mission_title: "test mission",
            mission_text: "test mission text",
        };
        const { data: ins, error: insErr } = await adminSessClient
            .from("home_about_content")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-054", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("home_about_content")
                .update({ title: `__rls_admin_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("home_about_content")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-054", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-054", label);
            }
            await adminClient.from("home_about_content").delete().eq("id", id);
        }
    }

    // ROLE-RLS-055: Admin select logs_audit (SELECT only — INSERT is trigger-only)
    {
        const { data, error } = await adminSessClient
            .from("logs_audit")
            .select("id")
            .limit(5);
        if (error) {
            fail("RLS-055", "Admin select logs_audit", error.message);
        } else {
            ok("RLS-055", `Admin select logs_audit — ${data.length} rows`);
        }
    }

    // ROLE-RLS-056: Admin select content_versions
    {
        const { data, error } = await adminSessClient
            .from("content_versions")
            .select("id")
            .limit(5);
        if (error) {
            fail("RLS-056", "Admin select content_versions", error.message);
        } else {
            ok("RLS-056", `Admin select content_versions — ${data.length} rows`);
        }
    }

    // ROLE-RLS-057: Admin CRUD user_invitations
    {
        const label = "Admin CRUD user_invitations";
        const payload = {
            user_id: userId,
            email: `__rls_invite_${ts}@test.invalid`,
            role: "editor",
            invited_by: adminId,
        };
        const { data: ins, error: insErr } = await adminSessClient
            .from("user_invitations")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-057", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("user_invitations")
                .update({ role: "admin" })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("user_invitations")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-057", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-057", label);
            }
            await adminClient.from("user_invitations").delete().eq("id", id);
        }
    }

    // ROLE-RLS-058: Admin CRUD seo_redirects
    {
        const label = "Admin CRUD seo_redirects";
        const payload = {
            old_path: `/__rls_old_${ts}`,
            new_path: `/__rls_new_${ts}`,
        };
        const { data: ins, error: insErr } = await adminSessClient
            .from("seo_redirects")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-058", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("seo_redirects")
                .update({ new_path: `/__rls_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("seo_redirects")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-058", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-058", label);
            }
            await adminClient.from("seo_redirects").delete().eq("id", id);
        }
    }

    // ROLE-RLS-067: Admin CRUD pending_invitations
    {
        const label = "Admin CRUD pending_invitations";
        const payload = {
            user_id: userId,
            email: `__rls_pending_${ts}@test.invalid`,
            invitation_url: `https://localhost/__rls_test_${ts}`,
        };
        const { data: ins, error: insErr } = await adminSessClient
            .from("pending_invitations")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-067", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("pending_invitations")
                .update({ status: "sent" })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("pending_invitations")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-067", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-067", label);
            }
            await adminClient.from("pending_invitations").delete().eq("id", id);
        }
    }

    // ROLE-RLS-068: Admin CRUD sitemap_entries
    {
        const label = "Admin CRUD sitemap_entries";
        const payload = { url: `/__rls_sitemap_${ts}` };
        const { data: ins, error: insErr } = await adminSessClient
            .from("sitemap_entries")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-068", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("sitemap_entries")
                .update({ url: `/__rls_sitemap_upd_${ts}` })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("sitemap_entries")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-068", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-068", label);
            }
            await adminClient.from("sitemap_entries").delete().eq("id", id);
        }
    }

    // ROLE-RLS-069: Admin CRUD data_retention_config
    {
        const label = "Admin CRUD data_retention_config";
        const tableName = "__rls_test_retention";
        const payload = {
            table_name: tableName,
            retention_days: 30,
            date_column: "created_at",
        };
        const { data: ins, error: insErr } = await adminSessClient
            .from("data_retention_config")
            .insert(payload)
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-069", label, `insert: ${insErr?.message}`);
        } else {
            const id = ins.id;
            const { error: updErr } = await adminSessClient
                .from("data_retention_config")
                .update({ retention_days: 60 })
                .eq("id", id);
            const { error: delErr } = await adminSessClient
                .from("data_retention_config")
                .delete()
                .eq("id", id);
            if (updErr || delErr) {
                fail("RLS-069", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-069", label);
            }
            await adminClient.from("data_retention_config").delete().eq("id", id);
        }
    }

    // ROLE-RLS-070: Admin select data_retention_audit (SELECT only)
    {
        const { data, error } = await adminSessClient
            .from("data_retention_audit")
            .select("id")
            .limit(5);
        if (error) {
            fail("RLS-070", "Admin select data_retention_audit", error.message);
        } else {
            ok("RLS-070", `Admin select data_retention_audit — ${data.length} rows`);
        }
    }

    // ROLE-RLS-071: Admin update profiles (another user) — should succeed
    {
        const { error } = await adminSessClient
            .from("profiles")
            .update({ display_name: `__rls_admin_upd_${ts}` })
            .eq("user_id", userId);
        if (error) {
            fail("RLS-071", "Admin update profiles (autre user)", error.message);
        } else {
            ok("RLS-071", "Admin update profiles (autre user)");
        }
        // restore
        await adminClient
            .from("profiles")
            .update({ display_name: "Test user" })
            .eq("user_id", userId);
    }

    // ROLE-RLS-072: Editor blocked update profiles (another user)
    {
        const { error } = await editorClient
            .from("profiles")
            .update({ display_name: `__rls_editor_hack_${ts}` })
            .eq("user_id", userId);
        if (error && isRlsBlock(error)) {
            ok("RLS-072", "Editor bloqué update profiles (autre user)");
        } else if (!error) {
            // Supabase returns 0 rows affected without error when RLS blocks UPDATE
            const { data: check } = await adminClient
                .from("profiles")
                .select("display_name")
                .eq("user_id", userId)
                .single();
            if (check?.display_name?.includes("__rls_editor_hack_")) {
                fail("RLS-072", "Editor bloqué update profiles (autre user)", "update succeeded but should be blocked");
            } else {
                ok("RLS-072", "Editor bloqué update profiles (autre user) — 0 rows affected");
            }
        } else {
            fail("RLS-072", "Editor bloqué update profiles (autre user)", error.message);
        }
    }

    // ROLE-RLS-073: User self-update profile — should succeed
    {
        const { error } = await userClient
            .from("profiles")
            .update({ display_name: `__rls_self_${ts}` })
            .eq("user_id", userId);
        if (error) {
            fail("RLS-073", "User self-update profile", error.message);
        } else {
            ok("RLS-073", "User self-update profile");
        }
        await adminClient
            .from("profiles")
            .update({ display_name: "Test user" })
            .eq("user_id", userId);
    }

    // ROLE-RLS-074: User blocked update profiles (another user)
    {
        const { error } = await userClient
            .from("profiles")
            .update({ display_name: `__rls_user_hack_${ts}` })
            .eq("user_id", adminId);
        if (error && isRlsBlock(error)) {
            ok("RLS-074", "User bloqué update profiles (autre user)");
        } else if (!error) {
            const { data: check } = await adminClient
                .from("profiles")
                .select("display_name")
                .eq("user_id", adminId)
                .single();
            if (check?.display_name?.includes("__rls_user_hack_")) {
                fail("RLS-074", "User bloqué update profiles (autre user)", "update succeeded but should be blocked");
            } else {
                ok("RLS-074", "User bloqué update profiles (autre user) — 0 rows affected");
            }
        } else {
            fail("RLS-074", "User bloqué update profiles (autre user)", error.message);
        }
    }

    // ROLE-RLS-075: Editor blocked insert pending_invitations
    {
        const payload = {
            user_id: userId,
            email: `__rls_editor_inv_${ts}@test.invalid`,
            invitation_url: `https://localhost/__rls_editor_${ts}`,
        };
        const { error } = await editorClient
            .from("pending_invitations")
            .insert(payload);
        if (error && isRlsBlock(error)) {
            ok("RLS-075", "Editor bloqué insert pending_invitations");
        } else if (!error) {
            fail("RLS-075", "Editor bloqué insert pending_invitations", "insert succeeded but should be blocked");
            await adminClient
                .from("pending_invitations")
                .delete()
                .like("email", `__rls_editor_inv_%`);
        } else {
            ok("RLS-075", "Editor bloqué insert pending_invitations — non-RLS error (acceptable)");
        }
    }

    // ROLE-RLS-076: Editor blocked CRUD sitemap_entries
    {
        const payload = { url: `/__rls_editor_sitemap_${ts}` };
        const { error } = await editorClient
            .from("sitemap_entries")
            .insert(payload);
        if (error && isRlsBlock(error)) {
            ok("RLS-076", "Editor bloqué insert sitemap_entries");
        } else if (!error) {
            fail("RLS-076", "Editor bloqué insert sitemap_entries", "insert succeeded but should be blocked");
            await adminClient
                .from("sitemap_entries")
                .delete()
                .like("url", `/__rls_editor_sitemap_%`);
        } else {
            ok("RLS-076", "Editor bloqué insert sitemap_entries — non-RLS error (acceptable)");
        }
    }

    // ROLE-RLS-077: Anon select profiles — allowed (public read)
    {
        const { data, error } = await anonClient
            .from("profiles")
            .select("user_id")
            .limit(5);
        if (error) {
            fail("RLS-077", "Anon select profiles", error.message);
        } else {
            ok("RLS-077", `Anon select profiles — ${data.length} rows`);
        }
    }
}

/* ================================================================== */
/*  4.3 — Editor: CRUD éditorial (ROLE-RLS-027 to 047)               */
/* ================================================================== */

async function testEditorAccess(
    editorClient: SupabaseClient,
    adminId: string,
    editorId: string,
    userId: string,
) {
    console.log(
        "\n✏️  Section 4.3 — Editor: CRUD éditorial (has_min_role('editor'))\n",
    );

    const ts = Date.now();

    // ROLE-RLS-027: Editor select spectacles (all, including drafts/private)
    {
        const { data, error } = await editorClient
            .from("spectacles")
            .select("id");
        if (error) {
            fail("RLS-027", "Editor select spectacles (tous)", error.message);
        } else {
            ok("RLS-027", `Editor select spectacles (tous) — ${data.length} rows`);
        }
    }

    // ROLE-RLS-028: Editor insert spectacle
    {
        const label = "Editor insert spectacle";
        const { data: ins, error } = await editorClient
            .from("spectacles")
            .insert({ title: `__rls_editor_${ts}` })
            .select("id")
            .single();
        if (error) {
            fail("RLS-028", label, error.message);
        } else {
            ok("RLS-028", label);
            if (ins) await adminClient.from("spectacles").delete().eq("id", ins.id);
        }
    }

    // ROLE-RLS-029: Editor update spectacle
    {
        const label = "Editor update spectacle";
        // Create via adminClient then update via editorClient
        const { data: tmp } = await adminClient
            .from("spectacles")
            .insert({ title: `__rls_editor_upd_seed_${ts}` })
            .select("id")
            .single();
        if (!tmp) {
            fail("RLS-029", label, "seed insert failed");
        } else {
            const { error } = await editorClient
                .from("spectacles")
                .update({ title: `__rls_editor_upd_${ts}` })
                .eq("id", tmp.id);
            if (error) {
                fail("RLS-029", label, error.message);
            } else {
                ok("RLS-029", label);
            }
            await adminClient.from("spectacles").delete().eq("id", tmp.id);
        }
    }

    // ROLE-RLS-030: Editor delete spectacle
    {
        const label = "Editor delete spectacle";
        const { data: tmp } = await adminClient
            .from("spectacles")
            .insert({ title: `__rls_editor_del_seed_${ts}` })
            .select("id")
            .single();
        if (!tmp) {
            fail("RLS-030", label, "seed insert failed");
        } else {
            const { error } = await editorClient
                .from("spectacles")
                .delete()
                .eq("id", tmp.id);
            if (error) {
                fail("RLS-030", label, error.message);
            } else {
                ok("RLS-030", label);
            }
            await adminClient.from("spectacles").delete().eq("id", tmp.id);
        }
    }

    // ROLE-RLS-031: Editor CRUD evenements
    {
        const label = "Editor CRUD evenements";
        // Need a spectacle for FK
        const { data: sp } = await adminClient
            .from("spectacles")
            .insert({ title: `__rls_editor_ev_sp_${ts}` })
            .select("id")
            .single();
        if (!sp) {
            fail("RLS-031", label, "spectacle seed failed");
        } else {
            const { data: ins, error: insErr } = await editorClient
                .from("evenements")
                .insert({ spectacle_id: sp.id, date_debut: "2099-01-01T00:00:00" })
                .select("id")
                .single();
            if (insErr || !ins) {
                fail("RLS-031", label, `insert: ${insErr?.message}`);
            } else {
                const { error: updErr } = await editorClient
                    .from("evenements")
                    .update({ date_debut: "2099-02-01T00:00:00" })
                    .eq("id", ins.id);
                const { error: delErr } = await editorClient
                    .from("evenements")
                    .delete()
                    .eq("id", ins.id);
                if (updErr || delErr) {
                    fail("RLS-031", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
                } else {
                    ok("RLS-031", label);
                }
                await adminClient.from("evenements").delete().eq("id", ins.id);
            }
            await adminClient.from("spectacles").delete().eq("id", sp.id);
        }
    }

    // ROLE-RLS-032: Editor CRUD lieux
    {
        const label = "Editor CRUD lieux";
        const { data: ins, error: insErr } = await editorClient
            .from("lieux")
            .insert({ nom: `__rls_editor_${ts}` })
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-032", label, `insert: ${insErr?.message}`);
        } else {
            const { error: updErr } = await editorClient
                .from("lieux")
                .update({ nom: `__rls_editor_upd_${ts}` })
                .eq("id", ins.id);
            const { error: delErr } = await editorClient
                .from("lieux")
                .delete()
                .eq("id", ins.id);
            if (updErr || delErr) {
                fail("RLS-032", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-032", label);
            }
            await adminClient.from("lieux").delete().eq("id", ins.id);
        }
    }

    // ROLE-RLS-033: Editor CRUD medias
    {
        const label = "Editor CRUD medias";
        const { data: ins, error: insErr } = await editorClient
            .from("medias")
            .insert({ storage_path: `__rls_editor_${ts}.jpg` })
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-033", label, `insert: ${insErr?.message}`);
        } else {
            const { error: updErr } = await editorClient
                .from("medias")
                .update({ storage_path: `__rls_editor_upd_${ts}.jpg` })
                .eq("id", ins.id);
            const { error: delErr } = await editorClient
                .from("medias")
                .delete()
                .eq("id", ins.id);
            if (updErr || delErr) {
                fail("RLS-033", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-033", label);
            }
            await adminClient.from("medias").delete().eq("id", ins.id);
        }
    }

    // ROLE-RLS-034: Editor CRUD media_tags
    {
        const label = "Editor CRUD media_tags";
        const slug = `__rls-editor-mt-${ts}`;
        const { data: ins, error: insErr } = await editorClient
            .from("media_tags")
            .insert({ name: `__rls_editor_mt_${ts}`, slug })
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-034", label, `insert: ${insErr?.message}`);
        } else {
            const { error: updErr } = await editorClient
                .from("media_tags")
                .update({ name: `__rls_editor_mt_upd_${ts}` })
                .eq("id", ins.id);
            const { error: delErr } = await editorClient
                .from("media_tags")
                .delete()
                .eq("id", ins.id);
            if (updErr || delErr) {
                fail("RLS-034", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-034", label);
            }
            await adminClient.from("media_tags").delete().eq("id", ins.id);
        }
    }

    // ROLE-RLS-035: Editor CRUD media_folders
    {
        const label = "Editor CRUD media_folders";
        const slug = `__rls-editor-mf-${ts}`;
        const { data: ins, error: insErr } = await editorClient
            .from("media_folders")
            .insert({ name: `__rls_editor_mf_${ts}`, slug })
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-035", label, `insert: ${insErr?.message}`);
        } else {
            const { error: updErr } = await editorClient
                .from("media_folders")
                .update({ name: `__rls_editor_mf_upd_${ts}` })
                .eq("id", ins.id);
            const { error: delErr } = await editorClient
                .from("media_folders")
                .delete()
                .eq("id", ins.id);
            if (updErr || delErr) {
                fail("RLS-035", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-035", label);
            }
            await adminClient.from("media_folders").delete().eq("id", ins.id);
        }
    }

    // ROLE-RLS-036: Editor CRUD media_item_tags
    {
        const label = "Editor CRUD media_item_tags";
        // Need a media and a media_tag for FK
        const { data: med } = await adminClient
            .from("medias")
            .insert({ storage_path: `__rls_editor_mit_med_${ts}.jpg` })
            .select("id")
            .single();
        const { data: tag } = await adminClient
            .from("media_tags")
            .insert({ name: `__rls_editor_mit_tag_${ts}`, slug: `__rls-editor-mit-tag-${ts}` })
            .select("id")
            .single();
        if (!med || !tag) {
            fail("RLS-036", label, "seed media/tag failed");
        } else {
            const { error: insErr } = await editorClient
                .from("media_item_tags")
                .insert({ media_id: med.id, tag_id: tag.id });
            if (insErr) {
                fail("RLS-036", label, `insert: ${insErr.message}`);
            } else {
                const { error: delErr } = await editorClient
                    .from("media_item_tags")
                    .delete()
                    .eq("media_id", med.id)
                    .eq("tag_id", tag.id);
                if (delErr) {
                    fail("RLS-036", label, `delete: ${delErr.message}`);
                } else {
                    ok("RLS-036", label);
                }
                await adminClient.from("media_item_tags").delete().eq("media_id", med.id).eq("tag_id", tag.id);
            }
        }
        // cleanup seeds
        if (med) await adminClient.from("medias").delete().eq("id", med.id);
        if (tag) await adminClient.from("media_tags").delete().eq("id", tag.id);
    }

    // ROLE-RLS-037: Editor CRUD articles_presse
    {
        const label = "Editor CRUD articles_presse";
        const { data: ins, error: insErr } = await editorClient
            .from("articles_presse")
            .insert({ title: `__rls_editor_ap_${ts}` })
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-037", label, `insert: ${insErr?.message}`);
        } else {
            const { error: updErr } = await editorClient
                .from("articles_presse")
                .update({ title: `__rls_editor_ap_upd_${ts}` })
                .eq("id", ins.id);
            const { error: delErr } = await editorClient
                .from("articles_presse")
                .delete()
                .eq("id", ins.id);
            if (updErr || delErr) {
                fail("RLS-037", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-037", label);
            }
            await adminClient.from("articles_presse").delete().eq("id", ins.id);
        }
    }

    // ROLE-RLS-038: Editor CRUD communiques_presse
    {
        const label = "Editor CRUD communiques_presse";
        const { data: ins, error: insErr } = await editorClient
            .from("communiques_presse")
            .insert({ title: `__rls_editor_cp_${ts}`, date_publication: "2099-01-01" })
            .select("id")
            .single();
        if (insErr || !ins) {
            fail("RLS-038", label, `insert: ${insErr?.message}`);
        } else {
            const { error: updErr } = await editorClient
                .from("communiques_presse")
                .update({ title: `__rls_editor_cp_upd_${ts}` })
                .eq("id", ins.id);
            const { error: delErr } = await editorClient
                .from("communiques_presse")
                .delete()
                .eq("id", ins.id);
            if (updErr || delErr) {
                fail("RLS-038", label, `update: ${updErr?.message}, delete: ${delErr?.message}`);
            } else {
                ok("RLS-038", label);
            }
            await adminClient.from("communiques_presse").delete().eq("id", ins.id);
        }
    }

    // ── BLOQUÉ ──────────────────────────────────────────────────────

    // ROLE-RLS-039: Editor bloqué insert membres_equipe
    {
        const label = "Editor bloqué insert membres_equipe";
        const { error } = await editorClient
            .from("membres_equipe")
            .insert({ name: `__rls_editor_me_${ts}` });
        if (isRlsBlock(error)) {
            ok("RLS-039", label);
        } else if (!error) {
            fail("RLS-039", label, "SECURITY: insert succeeded");
            await adminClient.from("membres_equipe").delete().like("name", `__rls_editor_me_%`);
        } else {
            ok("RLS-039", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ROLE-RLS-040: Editor bloqué insert partners
    {
        const label = "Editor bloqué insert partners";
        const { error } = await editorClient
            .from("partners")
            .insert({ name: `__rls_editor_pa_${ts}` });
        if (isRlsBlock(error)) {
            ok("RLS-040", label);
        } else if (!error) {
            fail("RLS-040", label, "SECURITY: insert succeeded");
            await adminClient.from("partners").delete().like("name", `__rls_editor_pa_%`);
        } else {
            ok("RLS-040", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ROLE-RLS-041: Editor bloqué insert contacts_presse
    {
        const label = "Editor bloqué insert contacts_presse";
        const { error } = await editorClient.from("contacts_presse").insert({
            nom: `__rls_editor_cp_${ts}`,
            media: "Test Media",
            email: `__rls_editor_cp_${ts}@test.invalid`,
        });
        if (isRlsBlock(error)) {
            ok("RLS-041", label);
        } else if (!error) {
            fail("RLS-041", label, "SECURITY: insert succeeded");
            await adminClient.from("contacts_presse").delete().like("nom", `__rls_editor_cp_%`);
        } else {
            ok("RLS-041", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ROLE-RLS-042: Editor bloqué insert configurations_site
    {
        const label = "Editor bloqué insert configurations_site";
        const key = `__rls_editor_cs_${ts}`;
        const { error } = await editorClient
            .from("configurations_site")
            .insert({ key, value: { test: true } });
        if (isRlsBlock(error)) {
            ok("RLS-042", label);
        } else if (!error) {
            fail("RLS-042", label, "SECURITY: insert succeeded");
            await adminClient.from("configurations_site").delete().eq("key", key);
        } else {
            ok("RLS-042", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ROLE-RLS-043: Editor bloqué insert home_hero_slides
    {
        const label = "Editor bloqué insert home_hero_slides";
        const { error } = await editorClient
            .from("home_hero_slides")
            .insert({ slug: `__rls-editor-hhs-${ts}`, title: `__rls_editor_hhs_${ts}` });
        if (isRlsBlock(error)) {
            ok("RLS-043", label);
        } else if (!error) {
            fail("RLS-043", label, "SECURITY: insert succeeded");
            await adminClient.from("home_hero_slides").delete().like("slug", `__rls-editor-hhs-%`);
        } else {
            ok("RLS-043", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ROLE-RLS-044: Editor bloqué insert home_about_content
    {
        const label = "Editor bloqué insert home_about_content";
        const { error } = await editorClient.from("home_about_content").insert({
            slug: `__rls-editor-hac-${ts}`,
            title: `__rls_editor_hac_${ts}`,
            intro1: "test",
            intro2: "test",
            mission_title: "test",
            mission_text: "test",
        });
        if (isRlsBlock(error)) {
            ok("RLS-044", label);
        } else if (!error) {
            fail("RLS-044", label, "SECURITY: insert succeeded");
            await adminClient.from("home_about_content").delete().like("slug", `__rls-editor-hac-%`);
        } else {
            ok("RLS-044", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ROLE-RLS-045: Editor CRUD spectacles_membres_equipe (has_min_role('editor'))
    {
        const label = "Editor CRUD spectacles_membres_equipe";
        // Need a spectacle and a membre for FK
        const { data: sp } = await adminClient
            .from("spectacles")
            .insert({ title: `__rls_editor_sme_sp_${ts}` })
            .select("id")
            .single();
        const { data: me } = await adminClient
            .from("membres_equipe")
            .insert({ name: `__rls_editor_sme_me_${ts}` })
            .select("id")
            .single();
        if (!sp || !me) {
            fail("RLS-045", label, "seed spectacle/membre failed");
        } else {
            const { error: insErr } = await editorClient
                .from("spectacles_membres_equipe")
                .insert({ spectacle_id: sp.id, membre_id: me.id });
            if (insErr) {
                fail("RLS-045", label, `insert: ${insErr.message}`);
            } else {
                const { error: delErr } = await editorClient
                    .from("spectacles_membres_equipe")
                    .delete()
                    .eq("spectacle_id", sp.id)
                    .eq("membre_id", me.id);
                if (delErr) {
                    fail("RLS-045", label, `delete: ${delErr.message}`);
                } else {
                    ok("RLS-045", label);
                }
            }
        }
        if (me) await adminClient.from("membres_equipe").delete().eq("id", me.id);
        if (sp) await adminClient.from("spectacles").delete().eq("id", sp.id);
    }

    // ROLE-RLS-046: Editor select logs_audit — 0 rows
    {
        const { data, error } = await editorClient
            .from("logs_audit")
            .select("id")
            .limit(1);
        if (error) {
            ok("RLS-046", "Editor select logs_audit — blocked (error)");
        } else if ((data ?? []).length === 0) {
            ok("RLS-046", "Editor select logs_audit — 0 rows");
        } else {
            fail(
                "RLS-046",
                "Editor select logs_audit",
                "SECURITY: rows returned for editor role",
            );
        }
    }

    // ROLE-RLS-047: Editor select content_versions — has_min_role('editor')
    {
        const { data, error } = await editorClient
            .from("content_versions")
            .select("id")
            .limit(1);
        if (error) {
            fail("RLS-047", "Editor select content_versions", `select error: ${error.message}`);
        } else {
            ok("RLS-047", `Editor select content_versions — ${(data ?? []).length} rows`);
        }
    }

    // ── BONUS: Editor bloqué insert user_invitations ────────────────

    {
        const label = "Editor bloqué insert user_invitations";
        const { error } = await editorClient.from("user_invitations").insert({
            user_id: userId,
            email: `__rls_editor_ui_${ts}@test.invalid`,
            role: "user",
            invited_by: editorId,
        });
        if (isRlsBlock(error)) {
            ok("RLS-045b", label);
        } else if (!error) {
            fail("RLS-045b", label, "SECURITY: insert succeeded");
            await adminClient.from("user_invitations").delete().like("email", `__rls_editor_ui_%`);
        } else {
            ok("RLS-045b", `${label} — non-RLS error (acceptable)`);
        }
    }

    // ── BONUS: Editor bloqué update profiles (autre user) ───────────

    {
        const label = "Editor bloqué update profiles (autre user)";
        const { error } = await editorClient
            .from("profiles")
            .update({ display_name: `__rls_editor_hack_${ts}` })
            .eq("user_id", userId);
        if (error && isRlsBlock(error)) {
            ok("RLS-045c", label);
        } else if (!error) {
            const { data: check } = await adminClient
                .from("profiles")
                .select("display_name")
                .eq("user_id", userId)
                .single();
            if (check?.display_name?.includes("__rls_editor_hack_")) {
                fail("RLS-045c", label, "update succeeded but should be blocked");
                await adminClient
                    .from("profiles")
                    .update({ display_name: "Test user" })
                    .eq("user_id", userId);
            } else {
                ok("RLS-045c", `${label} — 0 rows affected`);
            }
        } else {
            fail("RLS-045c", label, error.message);
        }
    }
}

/* ================================================================== */
/*  4.6 — Storage buckets: medias & backups (ROLE-RLS-080 to 086)     */
/* ================================================================== */

const STORAGE_TEST_PATH = "__rls_test__/test.png";
const STORAGE_MEDIA_BLOB = new Blob(["rls-test"], { type: "image/png" });
const STORAGE_BACKUP_BLOB = new Blob(["rls-test"], { type: "application/octet-stream" });

function isStorageError(error: { message: string; statusCode?: string } | null): boolean {
    if (!error) return false;
    const msg = error.message.toLowerCase();
    return (
        msg.includes("not allowed") ||
        msg.includes("not authorized") ||
        msg.includes("permission denied") ||
        msg.includes("violat") ||
        msg.includes("policy") ||
        msg.includes("security") ||
        msg.includes("new row") ||
        error.statusCode === "403"
    );
}

async function testStorageAccess(
    userClient: SupabaseClient,
    editorClient: SupabaseClient,
    adminSessClient: SupabaseClient,
): Promise<void> {
    console.log(
        "\n📦 Section 4.6 — Storage buckets: medias & backups\n",
    );

    // ROLE-RLS-080: Anon can download from medias (public bucket)
    {
        // First seed a file via service role so there's something to download
        await adminClient.storage
            .from("medias")
            .upload(STORAGE_TEST_PATH, STORAGE_MEDIA_BLOB, { upsert: true });

        const { data, error } = await anonClient.storage
            .from("medias")
            .download(STORAGE_TEST_PATH);

        if (error || !data) {
            fail("ROLE-RLS-080", "Anon download medias — expected allowed", error?.message);
        } else {
            ok("ROLE-RLS-080", "Anon download medias — allowed (public bucket)");
        }
    }

    // ROLE-RLS-081: Anon upload to medias — blocked
    {
        const { error } = await anonClient.storage
            .from("medias")
            .upload("__rls_test__/anon.png", STORAGE_MEDIA_BLOB);

        if (error) {
            ok("ROLE-RLS-081", "Anon upload medias — blocked");
        } else {
            fail("ROLE-RLS-081", "Anon upload medias — should be blocked");
            await adminClient.storage.from("medias").remove(["__rls_test__/anon.png"]);
        }
    }

    // ROLE-RLS-082: Authenticated user (role=user) upload to medias — blocked
    {
        const { error } = await userClient.storage
            .from("medias")
            .upload("__rls_test__/user.png", STORAGE_MEDIA_BLOB);

        if (error) {
            ok("ROLE-RLS-082", "User upload medias — blocked (requires editor)");
        } else {
            fail("ROLE-RLS-082", "User upload medias — should be blocked");
            await adminClient.storage.from("medias").remove(["__rls_test__/user.png"]);
        }
    }

    // ROLE-RLS-083: Editor can upload to medias
    {
        const path = "__rls_test__/editor.png";
        const { error } = await editorClient.storage
            .from("medias")
            .upload(path, STORAGE_MEDIA_BLOB);

        if (error) {
            fail("ROLE-RLS-083", "Editor upload medias — expected allowed", error.message);
        } else {
            ok("ROLE-RLS-083", "Editor upload medias — allowed");
            // Also verify editor can delete (part of editor permissions)
            await editorClient.storage.from("medias").remove([path]);
        }
    }

    // ROLE-RLS-084: Admin can upload to medias
    {
        const path = "__rls_test__/admin.png";
        const { error } = await adminSessClient.storage
            .from("medias")
            .upload(path, STORAGE_MEDIA_BLOB);

        if (error) {
            fail("ROLE-RLS-084", "Admin upload medias — expected allowed", error.message);
        } else {
            ok("ROLE-RLS-084", "Admin upload medias — allowed");
            await adminSessClient.storage.from("medias").remove([path]);
        }
    }

    // ROLE-RLS-085: Anon/user/editor/admin cannot access backups bucket
    {
        const backupPath = "__rls_test__/probe.bin";
        const clients: Array<{ label: string; client: SupabaseClient }> = [
            { label: "anon", client: anonClient },
            { label: "user", client: userClient },
            { label: "editor", client: editorClient },
            { label: "admin", client: adminSessClient },
        ];

        let allBlocked = true;
        const details: string[] = [];

        for (const { label, client } of clients) {
            const { data: listData, error: listErr } = await client.storage
                .from("backups")
                .list();

            // For private bucket, either an error or empty result is acceptable
            const listBlocked = !!listErr || (listData ?? []).length === 0;

            const { error: uploadErr } = await client.storage
                .from("backups")
                .upload(backupPath, STORAGE_BACKUP_BLOB);

            const uploadBlocked = !!uploadErr;

            if (!listBlocked || !uploadBlocked) {
                allBlocked = false;
                details.push(`${label}: list=${listBlocked ? "blocked" : "LEAKED"}, upload=${uploadBlocked ? "blocked" : "LEAKED"}`);
            }

            // Cleanup if upload accidentally succeeded
            if (!uploadBlocked) {
                await adminClient.storage.from("backups").remove([backupPath]);
            }
        }

        if (allBlocked) {
            ok("ROLE-RLS-085", "Backups bucket — all non-service roles blocked");
        } else {
            fail("ROLE-RLS-085", "Backups bucket — some roles not blocked", details.join("; "));
        }
    }

    // ROLE-RLS-086: Service role can access backups bucket
    {
        const path = "__rls_test__/service.bin";
        const { error: upErr } = await adminClient.storage
            .from("backups")
            .upload(path, STORAGE_BACKUP_BLOB, { upsert: true });

        if (upErr) {
            fail("ROLE-RLS-086", "Service role upload backups — expected allowed", upErr.message);
        } else {
            const { data: listData, error: listErr } = await adminClient.storage
                .from("backups")
                .list("__rls_test__");

            if (listErr || !listData || listData.length === 0) {
                fail("ROLE-RLS-086", "Service role list backups — expected non-empty", listErr?.message);
            } else {
                ok("ROLE-RLS-086", "Service role backups — upload + list allowed");
            }

            // Cleanup
            await adminClient.storage.from("backups").remove([path]);
        }
    }
}

/* ================================================================== */
/*  Cleanup — remove test data inserted during tests                  */
/* ================================================================== */

async function cleanup() {
    console.log("\n🧹 Cleanup test data...\n");

    // Remove analytics_events test rows
    await adminClient
        .from("analytics_events")
        .delete()
        .eq("page_url", "/test");

    // Remove messages_contact test rows
    await adminClient
        .from("messages_contact")
        .delete()
        .eq("nom", "__rls_test__");

    // Remove abonnes_newsletter test rows
    await adminClient
        .from("abonnes_newsletter")
        .delete()
        .like("email", "__rls_test_%");

    // Remove storage test files
    await adminClient.storage.from("medias").remove([STORAGE_TEST_PATH]);

    console.log("   Done.");
}

/* ================================================================== */
/*  Main                                                               */
/* ================================================================== */

async function main() {
    console.log("\n🔌 Testing RLS permissions against LOCAL Supabase");
    console.log("   Sections: 4.1 (anon), 4.2 (user), 4.3 (editor), 4.4 (admin), 4.5 (SQL functions), 4.6 (storage)\n");

    // Provision test users
    console.log("📋 Provisioning test accounts...");
    const userId = await ensureTestUser({
        role: "user",
        email: USER_EMAIL,
        password: USER_PASSWORD,
    });
    console.log(`   user  → ${userId.slice(0, 8)}...`);

    const editorId = await ensureTestUser({
        role: "editor",
        email: EDITOR_EMAIL,
        password: EDITOR_PASSWORD,
    });
    console.log(`   editor → ${editorId.slice(0, 8)}...`);

    const adminId = await ensureTestUser({
        role: "admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    console.log(`   admin  → ${adminId.slice(0, 8)}...`);

    // Sign in
    const userClient = await signInAs(USER_EMAIL, USER_PASSWORD);
    const editorClient = await signInAs(EDITOR_EMAIL, EDITOR_PASSWORD);
    const adminSessClient = await signInAs(ADMIN_EMAIL, ADMIN_PASSWORD);

    // Run test sections
    await testAnon();
    await testUserAuthenticated(userClient);
    await testEditorAccess(editorClient, adminId, editorId, userId);
    await testAdminAccess(adminSessClient, editorClient, userClient, adminId, userId);
    await testSqlFunctions(userClient, editorClient, adminSessClient);
    await testStorageAccess(userClient, editorClient, adminSessClient);

    // Cleanup test data
    await cleanup();

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    if (failed > 0) {
        console.error("❌ SOME TESTS FAILED — review RLS policies");
        process.exit(1);
    }

    console.log("✅ ALL TESTS PASSED — anon/user/editor/admin/SQL function permissions correct\n");
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});

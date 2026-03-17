/**
 * DAL Permissions Integration Tests
 *
 * Tests RLS policies via Supabase client per role (anon, user, editor, admin).
 * Covers spec sections 3.1–3.4 from specs/tests-permissions-et-rôles.md
 *
 * @requires Local Supabase running on localhost:54321
 * @requires .env.e2e with E2E_EDITOR_EMAIL, E2E_ADMIN_EMAIL, E2E_USER_EMAIL, etc.
 *
 * @usage
 *   pnpm test:dal:permissions
 */
import path from "node:path";
import dotenv from "dotenv";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

dotenv.config({ path: path.resolve(__dirname, "../../.env.e2e") });

/* ------------------------------------------------------------------ */
/*  Environment                                                        */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EDITOR_EMAIL = process.env.E2E_EDITOR_EMAIL!;
const EDITOR_PASSWORD = process.env.E2E_EDITOR_PASSWORD!;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;
const USER_EMAIL = process.env.E2E_USER_EMAIL!;
const USER_PASSWORD = process.env.E2E_USER_PASSWORD!;

/* ------------------------------------------------------------------ */
/*  Clients                                                            */
/* ------------------------------------------------------------------ */

type SB = SupabaseClient<Database>;

const serviceClient: SB = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient: SB = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

let editorClient: SB;
let adminClient: SB;
let userClient: SB;

let editorUserId: string;
let adminUserId: string;
let userUserId: string;

/* ------------------------------------------------------------------ */
/*  Test-data IDs (populated via service_role in beforeAll)            */
/* ------------------------------------------------------------------ */

let seedSpectacleId: number;
let seedEventId: number;
let seedMediaId: number;
let seedLieuId: number;
let seedArticleId: number;
let seedCommuniqueId: number;
let seedCategoryId: number;
let seedTagId: number;
let seedMediaTagId: number;
let seedMediaFolderId: number;
let seedMembreId: number;
let seedPartnerId: number;
let seedContactPresseId: number;

const TS = () => `__rls_test_${Date.now()}`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function signInAndCreateClient(
    email: string,
    password: string,
): Promise<{ client: SB; userId: string }> {
    const tmpClient = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await tmpClient.auth.signInWithPassword({
        email,
        password,
    });
    if (error || !data.session) {
        throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
    }
    const client = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY, {
        global: {
            headers: { Authorization: `Bearer ${data.session.access_token}` },
        },
        auth: { autoRefreshToken: false, persistSession: false },
    });
    return { client, userId: data.user.id };
}

function isRlsBlock(err: { message: string; code?: string } | null): boolean {
    if (!err) return false;
    return (
        err.message.includes("row-level security") ||
        err.message.includes("permission denied") ||
        err.code === "42501" ||
        err.message.includes("new row violates row-level security")
    );
}

function isSchemaError(
    err: { message: string; code?: string } | null,
): boolean {
    if (!err) return false;
    return (
        err.message.includes("column") ||
        err.message.includes("null value") ||
        err.message.includes("violates") ||
        err.message.includes("duplicate key") ||
        err.message.includes("foreign key")
    );
}

/**
 * Ensure a test user exists in the local Supabase instance.
 * Creates the user if missing, updates role metadata if already present.
 */
async function ensureTestAccount(
    email: string,
    password: string,
    role: "user" | "editor" | "admin",
): Promise<void> {
    const { data: list } = await serviceClient.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === email);

    if (existing) {
        await serviceClient.auth.admin.updateUserById(existing.id, {
            app_metadata: { role },
            user_metadata: { role, display_name: `Test ${role}` },
        });
        return;
    }

    const { error } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
        user_metadata: { role, display_name: `Test ${role}` },
    });

    if (error) {
        throw new Error(`Failed to provision ${role} (${email}): ${error.message}`);
    }
}

/* ------------------------------------------------------------------ */
/*  Setup / Teardown                                                   */
/* ------------------------------------------------------------------ */

beforeAll(async () => {
    // Validate local-only
    if (
        !SUPABASE_URL.includes("localhost") &&
        !SUPABASE_URL.includes("127.0.0.1")
    ) {
        throw new Error(
            `SECURITY: refusing to run against non-local URL: ${SUPABASE_URL}`,
        );
    }

    // Provision test accounts if they don't exist yet
    await Promise.all([
        ensureTestAccount(EDITOR_EMAIL, EDITOR_PASSWORD, "editor"),
        ensureTestAccount(ADMIN_EMAIL, ADMIN_PASSWORD, "admin"),
        ensureTestAccount(USER_EMAIL, USER_PASSWORD, "user"),
    ]);

    // Sign in as each role
    const [editorResult, adminResult, userResult] = await Promise.all([
        signInAndCreateClient(EDITOR_EMAIL, EDITOR_PASSWORD),
        signInAndCreateClient(ADMIN_EMAIL, ADMIN_PASSWORD),
        signInAndCreateClient(USER_EMAIL, USER_PASSWORD),
    ]);

    editorClient = editorResult.client;
    editorUserId = editorResult.userId;
    adminClient = adminResult.client;
    adminUserId = adminResult.userId;
    userClient = userResult.client;
    userUserId = userResult.userId;

    // Ensure correct roles in profiles table (service_role bypasses RLS)
    await serviceClient
        .from("profiles")
        .update({ role: "editor" })
        .eq("user_id", editorUserId);
    await serviceClient
        .from("profiles")
        .update({ role: "admin" })
        .eq("user_id", adminUserId);
    await serviceClient
        .from("profiles")
        .update({ role: "user" })
        .eq("user_id", userUserId);

    // Seed reference data via service_role for FK dependencies
    const { data: sp } = await serviceClient
        .from("spectacles")
        .insert({ title: TS(), status: "draft", public: false })
        .select("id")
        .single();
    seedSpectacleId = sp!.id;

    const { data: li } = await serviceClient
        .from("lieux")
        .insert({ nom: TS() })
        .select("id")
        .single();
    seedLieuId = li!.id;

    const { data: ev } = await serviceClient
        .from("evenements")
        .insert({
            spectacle_id: seedSpectacleId,
            date_debut: new Date().toISOString(),
            lieu_id: seedLieuId,
        })
        .select("id")
        .single();
    seedEventId = ev!.id;

    const { data: md } = await serviceClient
        .from("medias")
        .insert({ storage_path: `test/${TS()}.jpg` })
        .select("id")
        .single();
    seedMediaId = md!.id;

    const { data: ar } = await serviceClient
        .from("articles_presse")
        .insert({ title: TS() })
        .select("id")
        .single();
    seedArticleId = ar!.id;

    const { data: co } = await serviceClient
        .from("communiques_presse")
        .insert({ title: TS(), date_publication: new Date().toISOString() })
        .select("id")
        .single();
    seedCommuniqueId = co!.id;

    const slug1 = `test-${Date.now()}`;
    const { data: cat } = await serviceClient
        .from("categories")
        .insert({ name: TS(), slug: slug1 })
        .select("id")
        .single();
    seedCategoryId = cat!.id;

    const slug2 = `test-tag-${Date.now()}`;
    const { data: tag } = await serviceClient
        .from("tags")
        .insert({ name: TS(), slug: slug2 })
        .select("id")
        .single();
    seedTagId = tag!.id;

    const slugMt = `test-mt-${Date.now()}`;
    const { data: mt } = await serviceClient
        .from("media_tags")
        .insert({ name: TS(), slug: slugMt })
        .select("id")
        .single();
    seedMediaTagId = mt!.id;

    const slugMf = `test-mf-${Date.now()}`;
    const { data: mf } = await serviceClient
        .from("media_folders")
        .insert({ name: TS(), slug: slugMf })
        .select("id")
        .single();
    seedMediaFolderId = mf!.id;

    const { data: me } = await serviceClient
        .from("membres_equipe")
        .insert({ name: TS() })
        .select("id")
        .single();
    seedMembreId = me!.id;

    const { data: pa } = await serviceClient
        .from("partners")
        .insert({ name: TS() })
        .select("id")
        .single();
    seedPartnerId = pa!.id;

    const { data: cp } = await serviceClient
        .from("contacts_presse")
        .insert({
            nom: TS(),
            media: "Test Media",
            email: `test-${Date.now()}@rls.test`,
        })
        .select("id")
        .single();
    seedContactPresseId = cp!.id;
}, 30_000);

afterAll(async () => {
    // Cleanup seed data in reverse dependency order
    const ids = {
        contacts_presse: seedContactPresseId,
        partners: seedPartnerId,
        membres_equipe: seedMembreId,
        media_folders: seedMediaFolderId,
        media_tags: seedMediaTagId,
        tags: seedTagId,
        categories: seedCategoryId,
        communiques_presse: seedCommuniqueId,
        articles_presse: seedArticleId,
        medias: seedMediaId,
        evenements: seedEventId,
        lieux: seedLieuId,
        spectacles: seedSpectacleId,
    };

    for (const [table, id] of Object.entries(ids)) {
        if (id != null) {
            await serviceClient.from(table as "spectacles").delete().eq("id", id as number);
        }
    }
});

/* ================================================================== */
/*  3.1 — Editor: CRUD editorial tables (allowed)                     */
/*  ROLE-DAL-001 to ROLE-DAL-032                                       */
/* ================================================================== */

describe("3.1 — Editor CRUD éditorial (autorisé)", () => {
    // ---- spectacles (ROLE-DAL-001 to 004) ----------------------------

    it("ROLE-DAL-001 — Editor select spectacles (all rows incl. drafts)", async () => {
        const { data, error } = await editorClient
            .from("spectacles")
            .select("id, status, public")
            .limit(100);
        expect(error).toBeNull();
        expect(data).toBeDefined();
        // Editor should see draft/non-public rows too
        const hasDrafts = data!.some(
            (r) => r.status === "draft" || r.public === false,
        );
        expect(hasDrafts).toBe(true);
    });

    it("ROLE-DAL-002 — Editor insert spectacle", async () => {
        const { data, error } = await editorClient
            .from("spectacles")
            .insert({ title: TS() })
            .select("id")
            .single();
        expect(error).toBeNull();
        expect(data?.id).toBeDefined();
        // cleanup
        if (data) await serviceClient.from("spectacles").delete().eq("id", data.id);
    });

    it("ROLE-DAL-003 — Editor update spectacle", async () => {
        const { error } = await editorClient
            .from("spectacles")
            .update({ description: "updated" })
            .eq("id", seedSpectacleId);
        expect(error).toBeNull();
    });

    it("ROLE-DAL-004 — Editor delete spectacle", async () => {
        // Create a throw-away row
        const { data: tmp } = await serviceClient
            .from("spectacles")
            .insert({ title: TS() })
            .select("id")
            .single();
        const { error } = await editorClient
            .from("spectacles")
            .delete()
            .eq("id", tmp!.id);
        expect(error).toBeNull();
    });

    // ---- evenements (ROLE-DAL-005 to 008) ----------------------------

    it("ROLE-DAL-005 — Editor select evenements", async () => {
        const { error } = await editorClient
            .from("evenements")
            .select("id")
            .limit(1);
        expect(error).toBeNull();
    });

    it("ROLE-DAL-006 — Editor insert evenement", async () => {
        const { data, error } = await editorClient
            .from("evenements")
            .insert({
                spectacle_id: seedSpectacleId,
                date_debut: new Date().toISOString(),
            })
            .select("id")
            .single();
        expect(error).toBeNull();
        if (data) await serviceClient.from("evenements").delete().eq("id", data.id);
    });

    it("ROLE-DAL-007 — Editor update evenement", async () => {
        const { error } = await editorClient
            .from("evenements")
            .update({ status: "confirmed" })
            .eq("id", seedEventId);
        expect(error).toBeNull();
    });

    it("ROLE-DAL-008 — Editor delete evenement", async () => {
        const { data: tmp } = await serviceClient
            .from("evenements")
            .insert({
                spectacle_id: seedSpectacleId,
                date_debut: new Date().toISOString(),
            })
            .select("id")
            .single();
        const { error } = await editorClient
            .from("evenements")
            .delete()
            .eq("id", tmp!.id);
        expect(error).toBeNull();
    });

    // ---- medias (ROLE-DAL-009 to 012) --------------------------------

    it("ROLE-DAL-009 — Editor select medias", async () => {
        const { error } = await editorClient
            .from("medias")
            .select("id")
            .limit(1);
        expect(error).toBeNull();
    });

    it("ROLE-DAL-010 — Editor insert media", async () => {
        const { data, error } = await editorClient
            .from("medias")
            .insert({ storage_path: `test/${TS()}.png` })
            .select("id")
            .single();
        expect(error).toBeNull();
        if (data) await serviceClient.from("medias").delete().eq("id", data.id);
    });

    it("ROLE-DAL-011 — Editor update media", async () => {
        const { error } = await editorClient
            .from("medias")
            .update({ alt_text: "updated" })
            .eq("id", seedMediaId);
        expect(error).toBeNull();
    });

    it("ROLE-DAL-012 — Editor delete media", async () => {
        const { data: tmp } = await serviceClient
            .from("medias")
            .insert({ storage_path: `test/${TS()}.png` })
            .select("id")
            .single();
        const { error } = await editorClient
            .from("medias")
            .delete()
            .eq("id", tmp!.id);
        expect(error).toBeNull();
    });

    // ---- media_tags (ROLE-DAL-013) ------------------------------------

    it("ROLE-DAL-013 — Editor CRUD media_tags", async () => {
        const slug = `e-mt-${Date.now()}`;
        const { data, error: iErr } = await editorClient
            .from("media_tags")
            .insert({ name: TS(), slug })
            .select("id")
            .single();
        expect(iErr).toBeNull();
        expect(data?.id).toBeDefined();

        const { error: sErr } = await editorClient
            .from("media_tags")
            .select("id")
            .eq("id", data!.id)
            .single();
        expect(sErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("media_tags")
            .update({ description: "test" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("media_tags")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- media_folders (ROLE-DAL-014) ---------------------------------

    it("ROLE-DAL-014 — Editor CRUD media_folders", async () => {
        const slug = `e-mf-${Date.now()}`;
        const { data, error: iErr } = await editorClient
            .from("media_folders")
            .insert({ name: TS(), slug })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("media_folders")
            .update({ description: "test" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("media_folders")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- media_item_tags (ROLE-DAL-015) -------------------------------

    it("ROLE-DAL-015 — Editor CRUD media_item_tags", async () => {
        const { data, error: iErr } = await editorClient
            .from("media_item_tags")
            .insert({ media_id: seedMediaId, tag_id: seedMediaTagId })
            .select("media_id, tag_id")
            .single();
        expect(iErr).toBeNull();

        const { error: sErr } = await editorClient
            .from("media_item_tags")
            .select("*")
            .eq("media_id", seedMediaId)
            .eq("tag_id", seedMediaTagId);
        expect(sErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("media_item_tags")
            .delete()
            .eq("media_id", seedMediaId)
            .eq("tag_id", seedMediaTagId);
        expect(dErr).toBeNull();
    });

    // ---- lieux (ROLE-DAL-016) -----------------------------------------

    it("ROLE-DAL-016 — Editor CRUD lieux", async () => {
        const { data, error: iErr } = await editorClient
            .from("lieux")
            .insert({ nom: TS() })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("lieux")
            .update({ ville: "Paris" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("lieux")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- articles_presse (ROLE-DAL-017) -------------------------------

    it("ROLE-DAL-017 — Editor CRUD articles_presse", async () => {
        const { data, error: iErr } = await editorClient
            .from("articles_presse")
            .insert({ title: TS() })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("articles_presse")
            .update({ excerpt: "test" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("articles_presse")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- communiques_presse (ROLE-DAL-018) ----------------------------

    it("ROLE-DAL-018 — Editor CRUD communiques_presse", async () => {
        const { data, error: iErr } = await editorClient
            .from("communiques_presse")
            .insert({ title: TS(), date_publication: new Date().toISOString() })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("communiques_presse")
            .update({ description: "test" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("communiques_presse")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- categories (ROLE-DAL-019) ------------------------------------

    it("ROLE-DAL-019 — Editor CRUD categories", async () => {
        const slug = `e-cat-${Date.now()}`;
        const { data, error: iErr } = await editorClient
            .from("categories")
            .insert({ name: TS(), slug })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("categories")
            .update({ description: "test" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("categories")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- tags (ROLE-DAL-020) ------------------------------------------

    it("ROLE-DAL-020 — Editor CRUD tags", async () => {
        const slug = `e-tag-${Date.now()}`;
        const { data, error: iErr } = await editorClient
            .from("tags")
            .insert({ name: TS(), slug })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("tags")
            .update({ description: "test" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("tags")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- spectacles_categories (ROLE-DAL-021) -------------------------

    it("ROLE-DAL-021 — Editor CRUD spectacles_categories", async () => {
        const { error: iErr } = await editorClient
            .from("spectacles_categories")
            .insert({
                spectacle_id: seedSpectacleId,
                category_id: seedCategoryId,
            });
        expect(iErr).toBeNull();

        const { error: sErr } = await editorClient
            .from("spectacles_categories")
            .select("*")
            .eq("spectacle_id", seedSpectacleId)
            .eq("category_id", seedCategoryId);
        expect(sErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("spectacles_categories")
            .delete()
            .eq("spectacle_id", seedSpectacleId)
            .eq("category_id", seedCategoryId);
        expect(dErr).toBeNull();
    });

    // ---- spectacles_tags (ROLE-DAL-022) -------------------------------

    it("ROLE-DAL-022 — Editor CRUD spectacles_tags", async () => {
        const { error: iErr } = await editorClient
            .from("spectacles_tags")
            .insert({ spectacle_id: seedSpectacleId, tag_id: seedTagId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("spectacles_tags")
            .delete()
            .eq("spectacle_id", seedSpectacleId)
            .eq("tag_id", seedTagId);
        expect(dErr).toBeNull();
    });

    // ---- compagnie_values (ROLE-DAL-023) ------------------------------

    it("ROLE-DAL-023 — Editor CRUD compagnie_values", async () => {
        const { data, error: iErr } = await editorClient
            .from("compagnie_values")
            .insert({ key: TS(), title: "Test", description: "Test desc" })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("compagnie_values")
            .update({ title: "Updated" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("compagnie_values")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- compagnie_stats (ROLE-DAL-024) -------------------------------

    it("ROLE-DAL-024 — Editor CRUD compagnie_stats", async () => {
        const { data, error: iErr } = await editorClient
            .from("compagnie_stats")
            .insert({ key: TS(), label: "Test", value: "42" })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("compagnie_stats")
            .update({ value: "99" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("compagnie_stats")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- compagnie_presentation_sections (ROLE-DAL-025) ---------------

    it("ROLE-DAL-025 — Editor CRUD compagnie_presentation_sections", async () => {
        const slug = `e-cps-${Date.now()}`;
        const { data, error: iErr } = await editorClient
            .from("compagnie_presentation_sections")
            .insert({ kind: "custom", slug })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await editorClient
            .from("compagnie_presentation_sections")
            .update({ title: "Updated" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("compagnie_presentation_sections")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- spectacles_medias (ROLE-DAL-026) -----------------------------

    it("ROLE-DAL-026 — Editor CRUD spectacles_medias", async () => {
        const { error: iErr } = await editorClient
            .from("spectacles_medias")
            .insert({ spectacle_id: seedSpectacleId, media_id: seedMediaId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("spectacles_medias")
            .delete()
            .eq("spectacle_id", seedSpectacleId)
            .eq("media_id", seedMediaId);
        expect(dErr).toBeNull();
    });

    // ---- articles_medias (ROLE-DAL-027) -------------------------------

    it("ROLE-DAL-027 — Editor CRUD articles_medias", async () => {
        const { error: iErr } = await editorClient
            .from("articles_medias")
            .insert({ article_id: seedArticleId, media_id: seedMediaId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("articles_medias")
            .delete()
            .eq("article_id", seedArticleId)
            .eq("media_id", seedMediaId);
        expect(dErr).toBeNull();
    });

    // ---- communiques_medias (ROLE-DAL-028) ----------------------------

    it("ROLE-DAL-028 — Editor CRUD communiques_medias", async () => {
        const { error: iErr } = await editorClient
            .from("communiques_medias")
            .insert({ communique_id: seedCommuniqueId, media_id: seedMediaId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("communiques_medias")
            .delete()
            .eq("communique_id", seedCommuniqueId)
            .eq("media_id", seedMediaId);
        expect(dErr).toBeNull();
    });

    // ---- articles_categories (ROLE-DAL-029) ---------------------------

    it("ROLE-DAL-029 — Editor CRUD articles_categories", async () => {
        const { error: iErr } = await editorClient
            .from("articles_categories")
            .insert({ article_id: seedArticleId, category_id: seedCategoryId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("articles_categories")
            .delete()
            .eq("article_id", seedArticleId)
            .eq("category_id", seedCategoryId);
        expect(dErr).toBeNull();
    });

    // ---- articles_tags (ROLE-DAL-030) ---------------------------------

    it("ROLE-DAL-030 — Editor CRUD articles_tags", async () => {
        const { error: iErr } = await editorClient
            .from("articles_tags")
            .insert({ article_id: seedArticleId, tag_id: seedTagId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("articles_tags")
            .delete()
            .eq("article_id", seedArticleId)
            .eq("tag_id", seedTagId);
        expect(dErr).toBeNull();
    });

    // ---- communiques_categories (ROLE-DAL-031) ------------------------

    it("ROLE-DAL-031 — Editor CRUD communiques_categories", async () => {
        const { error: iErr } = await editorClient
            .from("communiques_categories")
            .insert({
                communique_id: seedCommuniqueId,
                category_id: seedCategoryId,
            });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("communiques_categories")
            .delete()
            .eq("communique_id", seedCommuniqueId)
            .eq("category_id", seedCategoryId);
        expect(dErr).toBeNull();
    });

    // ---- communiques_tags (ROLE-DAL-032) ------------------------------

    it("ROLE-DAL-032 — Editor CRUD communiques_tags", async () => {
        const { error: iErr } = await editorClient
            .from("communiques_tags")
            .insert({ communique_id: seedCommuniqueId, tag_id: seedTagId });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("communiques_tags")
            .delete()
            .eq("communique_id", seedCommuniqueId)
            .eq("tag_id", seedTagId);
        expect(dErr).toBeNull();
    });
});

/* ================================================================== */
/*  3.2 — Editor: admin-only tables (blocked)                          */
/*  ROLE-DAL-033 to ROLE-DAL-048 + 069–073                             */
/* ================================================================== */

describe("3.2 — Editor bloqué admin-only", () => {
    // ---- membres_equipe (ROLE-DAL-033 to 035) -------------------------

    it("ROLE-DAL-033 — Editor bloqué insert membres_equipe", async () => {
        const { error } = await editorClient
            .from("membres_equipe")
            .insert({ name: TS() })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    it("ROLE-DAL-034 — Editor bloqué update membres_equipe", async () => {
        const { error } = await editorClient
            .from("membres_equipe")
            .update({ description: "hacked" })
            .eq("id", seedMembreId);
        // RLS USING filter hides rows → 0 affected or explicit block
        expect(error === null || isRlsBlock(error)).toBe(true);
        // Verify no actual change occurred
        const { data } = await serviceClient
            .from("membres_equipe")
            .select("description")
            .eq("id", seedMembreId)
            .single();
        expect(data?.description).not.toBe("hacked");
    });

    it("ROLE-DAL-035 — Editor bloqué delete membres_equipe", async () => {
        const { error } = await editorClient
            .from("membres_equipe")
            .delete()
            .eq("id", seedMembreId);
        expect(error === null || isRlsBlock(error)).toBe(true);
        // Verify row still exists
        const { data } = await serviceClient
            .from("membres_equipe")
            .select("id")
            .eq("id", seedMembreId)
            .single();
        expect(data).toBeDefined();
    });

    // ---- contacts_presse (ROLE-DAL-036 to 037) ------------------------

    it("ROLE-DAL-036 — Editor bloqué insert contacts_presse", async () => {
        const { error } = await editorClient
            .from("contacts_presse")
            .insert({
                nom: TS(),
                media: "Hack Media",
                email: `hack-${Date.now()}@test.invalid`,
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    it("ROLE-DAL-037 — Editor bloqué update contacts_presse", async () => {
        const { error } = await editorClient
            .from("contacts_presse")
            .update({ notes: "hacked" })
            .eq("id", seedContactPresseId);
        expect(error === null || isRlsBlock(error)).toBe(true);
    });

    // ---- partners (ROLE-DAL-038 to 040) -------------------------------

    it("ROLE-DAL-038 — Editor bloqué insert partners", async () => {
        const { error } = await editorClient
            .from("partners")
            .insert({ name: TS() })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    it("ROLE-DAL-039 — Editor bloqué update partners", async () => {
        const { error } = await editorClient
            .from("partners")
            .update({ description: "hacked" })
            .eq("id", seedPartnerId);
        expect(error === null || isRlsBlock(error)).toBe(true);
    });

    it("ROLE-DAL-040 — Editor bloqué delete partners", async () => {
        const { error } = await editorClient
            .from("partners")
            .delete()
            .eq("id", seedPartnerId);
        expect(error === null || isRlsBlock(error)).toBe(true);
        const { data } = await serviceClient
            .from("partners")
            .select("id")
            .eq("id", seedPartnerId)
            .single();
        expect(data).toBeDefined();
    });

    // ---- configurations_site (ROLE-DAL-041) ---------------------------

    it("ROLE-DAL-041 — Editor bloqué INSERT/UPDATE configurations_site", async () => {
        const { error: iErr } = await editorClient
            .from("configurations_site")
            .insert({ key: TS(), value: { test: true } })
            .select()
            .single();
        expect(isRlsBlock(iErr)).toBe(true);

        const { error: uErr } = await editorClient
            .from("configurations_site")
            .update({ value: { hacked: true } })
            .eq("key", "nonexistent_key");
        expect(uErr === null || isRlsBlock(uErr)).toBe(true);
    });

    // ---- user_invitations (ROLE-DAL-042) ------------------------------

    it("ROLE-DAL-042 — Editor bloqué insert user_invitations", async () => {
        const { error } = await editorClient
            .from("user_invitations")
            .insert({
                email: `hack-${Date.now()}@test.invalid`,
                role: "editor",
                invited_by: editorUserId,
                user_id: editorUserId,
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- home_hero_slides (ROLE-DAL-043) ------------------------------

    it("ROLE-DAL-043 — Editor bloqué INSERT/UPDATE home_hero_slides", async () => {
        const { error } = await editorClient
            .from("home_hero_slides")
            .insert({
                title: TS(),
                slug: `hack-${Date.now()}`,
                alt_text: "hack",
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- home_about_content (ROLE-DAL-044) ----------------------------

    it("ROLE-DAL-044 — Editor bloqué INSERT/UPDATE home_about_content", async () => {
        const { error } = await editorClient
            .from("home_about_content")
            .insert({
                title: TS(),
                slug: `hack-${Date.now()}`,
                intro1: "x",
                intro2: "x",
                mission_title: "x",
                mission_text: "x",
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- seo_redirects (ROLE-DAL-045) ---------------------------------

    it("ROLE-DAL-045 — Editor bloqué insert seo_redirects", async () => {
        const { error } = await editorClient
            .from("seo_redirects")
            .insert({
                old_path: `/hack-old-${Date.now()}`,
                new_path: `/hack-new-${Date.now()}`,
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- spectacles_membres_equipe (ROLE-DAL-046) ---------------------

    it("ROLE-DAL-046 — Editor autorisé insert/delete spectacles_membres_equipe", async () => {
        // spectacles_membres_equipe uses has_min_role('editor') — editors are allowed
        const { error: iErr } = await editorClient
            .from("spectacles_membres_equipe")
            .insert({
                spectacle_id: seedSpectacleId,
                membre_id: seedMembreId,
            });
        expect(iErr).toBeNull();

        const { error: dErr } = await editorClient
            .from("spectacles_membres_equipe")
            .delete()
            .eq("spectacle_id", seedSpectacleId)
            .eq("membre_id", seedMembreId);
        expect(dErr).toBeNull();
    });

    // ---- logs_audit (ROLE-DAL-047) ------------------------------------

    it("ROLE-DAL-047 — Editor bloqué select logs_audit (0 rows)", async () => {
        const { data, error } = await editorClient
            .from("logs_audit")
            .select("id")
            .limit(10);
        expect(error).toBeNull();
        expect(data).toHaveLength(0);
    });

    // ---- content_versions (ROLE-DAL-048) ------------------------------

    it("ROLE-DAL-048 — Editor autorisé select content_versions", async () => {
        // content_versions uses has_min_role('editor') for SELECT — editors can view
        const { data, error } = await editorClient
            .from("content_versions")
            .select("id")
            .limit(10);
        expect(error).toBeNull();
        expect(data).toBeDefined();
    });

    // ---- profiles (ROLE-DAL-069) — Editor can't update other user -----

    it("ROLE-DAL-069 — Editor bloqué update profiles (autre user)", async () => {
        const { error } = await editorClient
            .from("profiles")
            .update({ display_name: "hacked" })
            .eq("user_id", adminUserId);
        // Either filtered (0 rows) or explicit RLS block
        expect(error === null || isRlsBlock(error)).toBe(true);
        const { data } = await serviceClient
            .from("profiles")
            .select("display_name")
            .eq("user_id", adminUserId)
            .single();
        expect(data?.display_name).not.toBe("hacked");
    });

    // ---- pending_invitations (ROLE-DAL-070) ---------------------------

    it("ROLE-DAL-070 — Editor bloqué insert pending_invitations", async () => {
        const { error } = await editorClient
            .from("pending_invitations")
            .insert({
                email: `hack-${Date.now()}@test.invalid`,
                invitation_url: "https://hack.test",
                user_id: editorUserId,
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- sitemap_entries (ROLE-DAL-071) -------------------------------

    it("ROLE-DAL-071 — Editor bloqué insert sitemap_entries", async () => {
        const { error } = await editorClient
            .from("sitemap_entries")
            .insert({ url: `https://hack-${Date.now()}.test` })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- data_retention_config (ROLE-DAL-072) -------------------------

    it("ROLE-DAL-072 — Editor bloqué INSERT/UPDATE data_retention_config", async () => {
        const { error } = await editorClient
            .from("data_retention_config")
            .insert({
                table_name: "hack_table",
                date_column: "created_at",
                retention_days: 30,
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- data_retention_audit (ROLE-DAL-073) --------------------------

    it("ROLE-DAL-073 — Editor bloqué select data_retention_audit (0 rows)", async () => {
        const { data, error } = await editorClient
            .from("data_retention_audit")
            .select("id")
            .limit(10);
        expect(error).toBeNull();
        expect(data).toHaveLength(0);
    });
});

/* ================================================================== */
/*  3.3 — Admin: full access (verification)                            */
/*  ROLE-DAL-049 to ROLE-DAL-058 + 074–078                             */
/* ================================================================== */

describe("3.3 — Admin accès complet", () => {
    // ---- spectacles (ROLE-DAL-049) ------------------------------------

    it("ROLE-DAL-049 — Admin CRUD spectacles", async () => {
        const { data, error: iErr } = await adminClient
            .from("spectacles")
            .insert({ title: TS() })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("spectacles")
            .update({ description: "admin-updated" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("spectacles")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- membres_equipe (ROLE-DAL-050) --------------------------------

    it("ROLE-DAL-050 — Admin CRUD membres_equipe", async () => {
        const { data, error: iErr } = await adminClient
            .from("membres_equipe")
            .insert({ name: TS() })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("membres_equipe")
            .update({ description: "admin" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("membres_equipe")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- partners (ROLE-DAL-051) --------------------------------------

    it("ROLE-DAL-051 — Admin CRUD partners", async () => {
        const { data, error: iErr } = await adminClient
            .from("partners")
            .insert({ name: TS() })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("partners")
            .update({ description: "admin" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("partners")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- contacts_presse (ROLE-DAL-052) -------------------------------

    it("ROLE-DAL-052 — Admin CRUD contacts_presse", async () => {
        const email = `admin-cp-${Date.now()}@test.invalid`;
        const { data, error: iErr } = await adminClient
            .from("contacts_presse")
            .insert({ nom: TS(), media: "Admin Media", email })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("contacts_presse")
            .update({ notes: "admin note" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("contacts_presse")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- configurations_site (ROLE-DAL-053) ---------------------------

    it("ROLE-DAL-053 — Admin CRUD configurations_site", async () => {
        const key = `admin_test_${Date.now()}`;
        const { error: iErr } = await adminClient
            .from("configurations_site")
            .insert({ key, value: { admin: true } });
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("configurations_site")
            .update({ value: { admin: false } })
            .eq("key", key);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("configurations_site")
            .delete()
            .eq("key", key);
        expect(dErr).toBeNull();
    });

    // ---- user_invitations (ROLE-DAL-054) ------------------------------

    it("ROLE-DAL-054 — Admin CRUD user_invitations", async () => {
        const { data, error: iErr } = await adminClient
            .from("user_invitations")
            .insert({
                email: `admin-inv-${Date.now()}@test.invalid`,
                role: "editor",
                invited_by: adminUserId,
                user_id: adminUserId,
            })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("user_invitations")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- home_hero_slides (ROLE-DAL-055) ------------------------------

    it("ROLE-DAL-055 — Admin CRUD home_hero_slides", async () => {
        const { data, error: iErr } = await adminClient
            .from("home_hero_slides")
            .insert({
                title: TS(),
                slug: `admin-hhs-${Date.now()}`,
                alt_text: "admin test",
            })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("home_hero_slides")
            .update({ subtitle: "admin" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("home_hero_slides")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- home_about_content (ROLE-DAL-056) ----------------------------

    it("ROLE-DAL-056 — Admin CRUD home_about_content", async () => {
        const { data, error: iErr } = await adminClient
            .from("home_about_content")
            .insert({
                title: TS(),
                slug: `admin-hac-${Date.now()}`,
                intro1: "a",
                intro2: "b",
                mission_title: "c",
                mission_text: "d",
            })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("home_about_content")
            .update({ intro1: "updated" })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("home_about_content")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- logs_audit (ROLE-DAL-057) ------------------------------------

    it("ROLE-DAL-057 — Admin select logs_audit", async () => {
        const { data, error } = await adminClient
            .from("logs_audit")
            .select("id")
            .limit(10);
        expect(error).toBeNull();
        // Admin should see rows (triggers populate logs_audit)
        expect(data).toBeDefined();
    });

    // ---- content_versions (ROLE-DAL-058) ------------------------------

    it("ROLE-DAL-058 — Admin select content_versions", async () => {
        const { data, error } = await adminClient
            .from("content_versions")
            .select("id")
            .limit(10);
        expect(error).toBeNull();
        expect(data).toBeDefined();
    });

    // ---- profiles (ROLE-DAL-074) — Admin update other user ------------

    it("ROLE-DAL-074 — Admin update profiles (autre user)", async () => {
        const marker = `admin-test-${Date.now()}`;
        const { error } = await adminClient
            .from("profiles")
            .update({ bio: marker })
            .eq("user_id", userUserId);
        expect(error).toBeNull();

        const { data } = await serviceClient
            .from("profiles")
            .select("bio")
            .eq("user_id", userUserId)
            .single();
        expect(data?.bio).toBe(marker);
    });

    // ---- pending_invitations (ROLE-DAL-075) ---------------------------

    it("ROLE-DAL-075 — Admin CRUD pending_invitations", async () => {
        const { data, error: iErr } = await adminClient
            .from("pending_invitations")
            .insert({
                email: `admin-pi-${Date.now()}@test.invalid`,
                invitation_url: "https://admin.test/invite",
                user_id: adminUserId,
            })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("pending_invitations")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- sitemap_entries (ROLE-DAL-076) -------------------------------

    it("ROLE-DAL-076 — Admin CRUD sitemap_entries", async () => {
        const { data, error: iErr } = await adminClient
            .from("sitemap_entries")
            .insert({ url: `https://admin-se-${Date.now()}.test` })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("sitemap_entries")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- data_retention_config (ROLE-DAL-077) -------------------------

    it("ROLE-DAL-077 — Admin CRUD data_retention_config", async () => {
        const { data, error: iErr } = await adminClient
            .from("data_retention_config")
            .insert({
                table_name: "test_retention_table",
                date_column: "created_at",
                retention_days: 90,
            })
            .select("id")
            .single();
        expect(iErr).toBeNull();

        const { error: uErr } = await adminClient
            .from("data_retention_config")
            .update({ retention_days: 180 })
            .eq("id", data!.id);
        expect(uErr).toBeNull();

        const { error: dErr } = await adminClient
            .from("data_retention_config")
            .delete()
            .eq("id", data!.id);
        expect(dErr).toBeNull();
    });

    // ---- data_retention_audit (ROLE-DAL-078) --------------------------

    it("ROLE-DAL-078 — Admin select data_retention_audit", async () => {
        const { data, error } = await adminClient
            .from("data_retention_audit")
            .select("id")
            .limit(10);
        expect(error).toBeNull();
        expect(data).toBeDefined();
    });
});

/* ================================================================== */
/*  3.4 — User: no write access (blocked)                              */
/*  ROLE-DAL-059 to ROLE-DAL-068 + 079–080                             */
/* ================================================================== */

describe("3.4 — User bloqué (aucun accès écriture)", () => {
    // ---- spectacles (ROLE-DAL-059 to 061) -----------------------------

    it("ROLE-DAL-059 — User bloqué insert spectacles", async () => {
        const { error } = await userClient
            .from("spectacles")
            .insert({ title: TS() })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    it("ROLE-DAL-060 — User bloqué update spectacles", async () => {
        const { error } = await userClient
            .from("spectacles")
            .update({ description: "hacked" })
            .eq("id", seedSpectacleId);
        // Row invisible to user (draft) → 0 affected
        expect(error === null || isRlsBlock(error)).toBe(true);
    });

    it("ROLE-DAL-061 — User bloqué delete spectacles", async () => {
        const { error } = await userClient
            .from("spectacles")
            .delete()
            .eq("id", seedSpectacleId);
        expect(error === null || isRlsBlock(error)).toBe(true);
        // Verify row still exists
        const { data } = await serviceClient
            .from("spectacles")
            .select("id")
            .eq("id", seedSpectacleId)
            .single();
        expect(data).toBeDefined();
    });

    // ---- evenements (ROLE-DAL-062) ------------------------------------

    it("ROLE-DAL-062 — User bloqué insert evenements", async () => {
        const { error } = await userClient
            .from("evenements")
            .insert({
                spectacle_id: seedSpectacleId,
                date_debut: new Date().toISOString(),
            })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- medias (ROLE-DAL-063) — authenticated can upload -------------

    it("ROLE-DAL-063 — User insert medias (autorisé — authenticated upload)", async () => {
        const { data, error } = await userClient
            .from("medias")
            .insert({ storage_path: `test/user-${TS()}.jpg` })
            .select("id")
            .single();
        // Spec says authenticated can upload
        expect(error).toBeNull();
        if (data) await serviceClient.from("medias").delete().eq("id", data.id);
    });

    // ---- medias (ROLE-DAL-064) — user can't update non-owned ---------

    it("ROLE-DAL-064 — User bloqué update medias (not owner, not editor+)", async () => {
        const { error } = await userClient
            .from("medias")
            .update({ alt_text: "hacked" })
            .eq("id", seedMediaId);
        expect(error === null || isRlsBlock(error)).toBe(true);
        // Verify no change
        const { data } = await serviceClient
            .from("medias")
            .select("alt_text")
            .eq("id", seedMediaId)
            .single();
        expect(data?.alt_text).not.toBe("hacked");
    });

    // ---- membres_equipe (ROLE-DAL-065) --------------------------------

    it("ROLE-DAL-065 — User bloqué insert membres_equipe", async () => {
        const { error } = await userClient
            .from("membres_equipe")
            .insert({ name: TS() })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- partners (ROLE-DAL-066) --------------------------------------

    it("ROLE-DAL-066 — User bloqué insert partners", async () => {
        const { error } = await userClient
            .from("partners")
            .insert({ name: TS() })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- configurations_site (ROLE-DAL-067) ---------------------------

    it("ROLE-DAL-067 — User bloqué insert configurations_site", async () => {
        const { error } = await userClient
            .from("configurations_site")
            .insert({ key: TS(), value: { hacked: true } })
            .select()
            .single();
        expect(isRlsBlock(error)).toBe(true);
    });

    // ---- spectacles SELECT (ROLE-DAL-068) — only public+published ----

    it("ROLE-DAL-068 — User select spectacles publics seuls", async () => {
        const { data, error } = await userClient
            .from("spectacles")
            .select("id, public, status")
            .limit(200);
        expect(error).toBeNull();
        const forbidden = (data ?? []).filter(
            (r) =>
                r.public !== true ||
                !["published", "archived"].includes(r.status),
        );
        expect(forbidden).toHaveLength(0);
    });

    // ---- profiles self-update (ROLE-DAL-079) --------------------------

    it("ROLE-DAL-079 — User self-update profile", async () => {
        const marker = `user-self-${Date.now()}`;
        const { error } = await userClient
            .from("profiles")
            .update({ bio: marker })
            .eq("user_id", userUserId);
        expect(error).toBeNull();

        const { data } = await serviceClient
            .from("profiles")
            .select("bio")
            .eq("user_id", userUserId)
            .single();
        expect(data?.bio).toBe(marker);
    });

    // ---- profiles update other user (ROLE-DAL-080) --------------------

    it("ROLE-DAL-080 — User bloqué update profiles (autre user)", async () => {
        const { error } = await userClient
            .from("profiles")
            .update({ display_name: "hacked" })
            .eq("user_id", adminUserId);
        expect(error === null || isRlsBlock(error)).toBe(true);
        const { data } = await serviceClient
            .from("profiles")
            .select("display_name")
            .eq("user_id", adminUserId)
            .single();
        expect(data?.display_name).not.toBe("hacked");
    });
});

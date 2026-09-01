/**
 * Audit Trail & Ownership Integration Tests
 *
 * Covers section 7 of the test strategy:
 *   - `trg_audit` writes a matching row in public.logs_audit for INSERT/UPDATE/DELETE
 *   - the recorded payload matches the operation actually performed
 *   - logs_audit is append-only from the client's point of view (no direct INSERT)
 *   - ownership columns (partners.created_by, medias.uploaded_by) cannot be
 *     hijacked by a non-privileged authenticated user
 *
 * @requires Local Supabase running on localhost:54321
 * @requires .env.e2e with E2E_* credentials
 *
 * @usage
 *   pnpm test:integration
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
    assertLocalSupabase,
    createServiceClient,
    ensureTestAccount,
    isRlsBlock,
    shouldRunIntegrationTests as shouldRun,
    signInAndCreateClient,
    syncProfileRole,
    TEST_ACCOUNTS,
    testLabel,
    type SB,
} from "./helpers/supabase";

const serviceClient: SB = createServiceClient();

let adminClient: SB;
let userClient: SB;
let adminUserId: string;
let userUserId: string;

/** Rows created by this suite, cleaned up in afterAll. */
const createdPartnerIds: number[] = [];
const createdMediaIds: number[] = [];

type AuditRow = {
    action: string;
    table_name: string;
    record_id: string | null;
    user_id: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
};

/**
 * The audit trigger fires AFTER the statement; PostgREST may return before the
 * row is visible, so poll briefly instead of asserting immediately.
 */
async function findAuditEntry(
    tableName: string,
    recordId: number | string,
    action: "INSERT" | "UPDATE" | "DELETE"
): Promise<AuditRow | null> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const { data } = await serviceClient
            .from("logs_audit")
            .select("action, table_name, record_id, user_id, old_values, new_values")
            .eq("table_name", tableName)
            .eq("record_id", String(recordId))
            .eq("action", action)
            .order("created_at", { ascending: false })
            .limit(1);

        if (data && data.length > 0) return data[0] as AuditRow;
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return null;
}

beforeAll(async () => {
    if (!shouldRun) return;

    assertLocalSupabase();

    await Promise.all([
        ensureTestAccount(
            serviceClient,
            TEST_ACCOUNTS.admin.email,
            TEST_ACCOUNTS.admin.password,
            "admin"
        ),
        ensureTestAccount(
            serviceClient,
            TEST_ACCOUNTS.user.email,
            TEST_ACCOUNTS.user.password,
            "user"
        ),
    ]);

    const [admin, user] = await Promise.all([
        signInAndCreateClient(
            TEST_ACCOUNTS.admin.email,
            TEST_ACCOUNTS.admin.password
        ),
        signInAndCreateClient(
            TEST_ACCOUNTS.user.email,
            TEST_ACCOUNTS.user.password
        ),
    ]);

    adminClient = admin.client;
    adminUserId = admin.userId;
    userClient = user.client;
    userUserId = user.userId;

    await syncProfileRole(serviceClient, adminUserId, "admin");
    await syncProfileRole(serviceClient, userUserId, "user");
});

afterAll(async () => {
    if (!shouldRun) return;

    for (const id of createdPartnerIds) {
        await serviceClient.from("partners").delete().eq("id", id);
    }
    for (const id of createdMediaIds) {
        await serviceClient.from("medias").delete().eq("id", id);
    }
});

/* ================================================================== */
/*  AUDIT-001 to AUDIT-004 — audit trail on partners                  */
/* ================================================================== */

describe.runIf(shouldRun)("Audit trail — partners", () => {
    it("AUDIT-001 — records an INSERT with the new values and the acting user", async () => {
        const name = testLabel("audit_partner");

        const { data, error } = await adminClient
            .from("partners")
            .insert({ name })
            .select("id")
            .single();

        expect(error).toBeNull();
        createdPartnerIds.push(data!.id);

        const entry = await findAuditEntry("partners", data!.id, "INSERT");

        expect(entry).not.toBeNull();
        expect(entry!.user_id).toBe(adminUserId);
        expect(entry!.new_values).toMatchObject({ name });
        expect(entry!.old_values).toBeNull();
    });

    it("AUDIT-002 — records an UPDATE with the resulting values", async () => {
        const initialName = testLabel("audit_partner_before");
        const updatedName = testLabel("audit_partner_after");

        const { data } = await adminClient
            .from("partners")
            .insert({ name: initialName })
            .select("id")
            .single();
        createdPartnerIds.push(data!.id);

        const { error } = await adminClient
            .from("partners")
            .update({ name: updatedName })
            .eq("id", data!.id);
        expect(error).toBeNull();

        const entry = await findAuditEntry("partners", data!.id, "UPDATE");

        expect(entry).not.toBeNull();
        expect(entry!.user_id).toBe(adminUserId);
        expect(entry!.new_values).toMatchObject({ name: updatedName });
        // public.audit_trigger() only snapshots old_values on DELETE.
        expect(entry!.old_values).toBeNull();
    });

    it("AUDIT-003 — records a DELETE with the old values", async () => {
        const name = testLabel("audit_partner_deleted");

        const { data } = await adminClient
            .from("partners")
            .insert({ name })
            .select("id")
            .single();

        const { error } = await adminClient
            .from("partners")
            .delete()
            .eq("id", data!.id);
        expect(error).toBeNull();

        const entry = await findAuditEntry("partners", data!.id, "DELETE");

        expect(entry).not.toBeNull();
        expect(entry!.old_values).toMatchObject({ name });
        expect(entry!.new_values).toBeNull();
    });
});

/* ================================================================== */
/*  AUDIT-004 — audit trail on medias                                 */
/* ================================================================== */

describe.runIf(shouldRun)("Audit trail — medias", () => {
    it("AUDIT-004 — records an INSERT performed by a plain authenticated user", async () => {
        const storagePath = `test/${testLabel("audit_media")}.jpg`;

        const { data, error } = await userClient
            .from("medias")
            .insert({ storage_path: storagePath, uploaded_by: userUserId })
            .select("id")
            .single();

        expect(error).toBeNull();
        createdMediaIds.push(data!.id);

        const entry = await findAuditEntry("medias", data!.id, "INSERT");

        expect(entry).not.toBeNull();
        expect(entry!.user_id).toBe(userUserId);
        expect(entry!.new_values).toMatchObject({ storage_path: storagePath });
    });
});

/* ================================================================== */
/*  AUDIT-005 to AUDIT-006 — logs_audit integrity                     */
/* ================================================================== */

describe.runIf(shouldRun)("logs_audit integrity", () => {
    it("AUDIT-005 — rejects a direct INSERT from an admin client (trigger-only table)", async () => {
        const { error } = await adminClient.from("logs_audit").insert({
            action: "DELETE",
            table_name: "partners",
            record_id: "999999",
            user_id: adminUserId,
        });

        expect(error).not.toBeNull();
        expect(isRlsBlock(error)).toBe(true);
    });

    it("AUDIT-006 — rejects a direct INSERT from a plain authenticated user", async () => {
        const { error } = await userClient.from("logs_audit").insert({
            action: "INSERT",
            table_name: "profiles",
            record_id: userUserId,
            user_id: userUserId,
        });

        expect(error).not.toBeNull();
        expect(isRlsBlock(error)).toBe(true);
    });
});

/* ================================================================== */
/*  OWN-001 to OWN-003 — ownership columns                            */
/* ================================================================== */

describe.runIf(shouldRun)("Ownership columns", () => {
    it("OWN-001 — persists partners.created_by set by the admin client", async () => {
        const { data, error } = await adminClient
            .from("partners")
            .insert({ name: testLabel("own_partner"), created_by: adminUserId })
            .select("id, created_by")
            .single();

        expect(error).toBeNull();
        createdPartnerIds.push(data!.id);
        expect(data!.created_by).toBe(adminUserId);
    });

    it("OWN-002 — blocks a plain user from creating a partner (editor+ only)", async () => {
        const { error } = await userClient
            .from("partners")
            .insert({ name: testLabel("own_partner_forbidden") });

        expect(error).not.toBeNull();
        expect(isRlsBlock(error)).toBe(true);
    });

    it("OWN-003 — blocks a plain user from taking over a media owned by someone else", async () => {
        const { data: foreignMedia } = await serviceClient
            .from("medias")
            .insert({
                storage_path: `test/${testLabel("own_media")}.jpg`,
                uploaded_by: adminUserId,
            })
            .select("id")
            .single();
        createdMediaIds.push(foreignMedia!.id);

        const { data: updated, error } = await userClient
            .from("medias")
            .update({ uploaded_by: userUserId })
            .eq("id", foreignMedia!.id)
            .select("id");

        // RLS blocks the write either with an error or by matching zero rows.
        const wasBlocked = error !== null || (updated?.length ?? 0) === 0;
        expect(wasBlocked).toBe(true);

        const { data: after } = await serviceClient
            .from("medias")
            .select("uploaded_by")
            .eq("id", foreignMedia!.id)
            .single();

        expect(after!.uploaded_by).toBe(adminUserId);
    });
});

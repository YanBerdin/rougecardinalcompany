/**
 * Shared plumbing for Supabase integration tests.
 *
 * @requires Local Supabase running on localhost:54321
 * @requires .env.e2e with E2E_* credentials
 */
import path from "node:path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.e2e") });

export type SB = SupabaseClient<Database>;

export type TestRole = "user" | "editor" | "admin";

/**
 * Integration tests hit a real database, so they are opt-in.
 * Enable with RUN_DAL_INTEGRATION_TESTS=1 (see `pnpm test:integration`).
 */
export const shouldRunIntegrationTests =
    process.env.RUN_DAL_INTEGRATION_TESTS === "1";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const PUBLISHABLE_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
export const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const TEST_ACCOUNTS: Record<
    TestRole,
    { email: string; password: string }
> = {
    editor: {
        email: process.env.E2E_EDITOR_EMAIL!,
        password: process.env.E2E_EDITOR_PASSWORD!,
    },
    admin: {
        email: process.env.E2E_ADMIN_EMAIL!,
        password: process.env.E2E_ADMIN_PASSWORD!,
    },
    user: {
        email: process.env.E2E_USER_EMAIL!,
        password: process.env.E2E_USER_PASSWORD!,
    },
};

/**
 * Hard stop if the configured instance is not local: integration tests
 * create and delete rows and must never touch a shared or production database.
 */
export function assertLocalSupabase(): void {
    if (
        !SUPABASE_URL.includes("localhost") &&
        !SUPABASE_URL.includes("127.0.0.1")
    ) {
        throw new Error(
            `SECURITY: refusing to run against non-local URL: ${SUPABASE_URL}`
        );
    }
}

export function createServiceClient(): SB {
    if (!shouldRunIntegrationTests) return {} as SB;
    return createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export function createAnonClient(): SB {
    if (!shouldRunIntegrationTests) return {} as SB;
    return createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

/**
 * Signs in and returns a client scoped to that user's JWT (RLS applies).
 */
export async function signInAndCreateClient(
    email: string,
    password: string
): Promise<{ client: SB; userId: string }> {
    const tmpClient = createAnonClient();
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

/**
 * Creates the test account if missing, otherwise realigns its role metadata.
 */
export async function ensureTestAccount(
    serviceClient: SB,
    email: string,
    password: string,
    role: TestRole
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

/**
 * Authorization decisions rely on `profiles.role`, not on the JWT metadata.
 */
export async function syncProfileRole(
    serviceClient: SB,
    userId: string,
    role: TestRole
): Promise<void> {
    await serviceClient.from("profiles").update({ role }).eq("user_id", userId);
}

export function isRlsBlock(
    err: { message: string; code?: string } | null
): boolean {
    if (!err) return false;
    return (
        err.message.includes("row-level security") ||
        err.message.includes("permission denied") ||
        err.code === "42501" ||
        err.message.includes("new row violates row-level security")
    );
}

export function isSchemaError(
    err: { message: string; code?: string } | null
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

/** Collision-free marker for rows created by integration tests. */
export function testLabel(prefix = "__it_test"): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

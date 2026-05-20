/**
 * Backfill Script: auth.users.raw_app_meta_data.role ↔ public.profiles.role
 *
 * Purpose: Idempotent reconciliation of the role invariant required by the
 *          new SECURITY DEFINER trigger model (TASK096 Phase 1).
 *
 *          Ensures, for every auth.users row:
 *            - A matching public.profiles row exists.
 *            - auth.users.raw_app_meta_data->>'role' === profiles.role.
 *
 *          Also reports orphan public.profiles (profile without auth.user)
 *          for manual review — these are NOT deleted by this script.
 *
 * Usage:
 *   Dry-run (default, no writes):  pnpm exec tsx scripts/backfill-app-metadata-role.ts
 *   Apply changes:                  pnpm exec tsx scripts/backfill-app-metadata-role.ts --apply
 *
 * Safety:
 *   - Dry-run by default; --apply required to mutate.
 *   - Uses service_role client (no cookies, no RLS).
 *   - Preserves existing app_metadata fields (spread merge).
 *
 * Plan: .github/prompts/plan-TASK096-hardenAuthRoleSecurity.prompt.md (Phase 1 Step 1)
 */

import "dotenv/config";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { env } from "../lib/env.js";
import type { AppRole } from "../lib/auth/role-helpers.ts";

// ============================================================================
// Configuration
// ============================================================================

const VALID_ROLES: ReadonlySet<AppRole> = new Set(["user", "editor", "admin"]);
const DEFAULT_ROLE: AppRole = "user";
const PAGE_SIZE = 1000;
const APPLY = process.argv.includes("--apply");

// ============================================================================
// Types
// ============================================================================

interface ProfileRow {
    user_id: string;
    role: AppRole;
}

interface BackfillStats {
    authUsersScanned: number;
    profilesScanned: number;
    alreadyConsistent: number;
    appMetadataBackfilled: number;
    profilesCreated: number;
    orphanProfilesDetected: number;
    errors: number;
}

// ============================================================================
// Helpers
// ============================================================================

function extractAppRole(user: User): AppRole | null {
    const raw = (user.app_metadata as Record<string, unknown> | null | undefined)?.role;
    if (typeof raw !== "string") return null;
    return VALID_ROLES.has(raw as AppRole) ? (raw as AppRole) : null;
}

async function fetchAllAuthUsers(supabase: SupabaseClient): Promise<User[]> {
    const all: User[] = [];
    let page = 1;
    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
        if (error) throw new Error(`listUsers page ${page} failed: ${error.message}`);
        all.push(...data.users);
        if (data.users.length < PAGE_SIZE) break;
        page++;
    }
    return all;
}

async function fetchAllProfiles(supabase: SupabaseClient): Promise<ProfileRow[]> {
    const { data, error } = await supabase.from("profiles").select("user_id, role");
    if (error) throw new Error(`profiles fetch failed: ${error.message}`);
    return (data ?? []) as ProfileRow[];
}

async function syncAppMetadataRole(
    supabase: SupabaseClient,
    user: User,
    targetRole: AppRole,
): Promise<void> {
    const merged = { ...(user.app_metadata ?? {}), role: targetRole };
    const { error } = await supabase.auth.admin.updateUserById(user.id, { app_metadata: merged });
    if (error) throw new Error(error.message);
}

async function createProfile(
    supabase: SupabaseClient,
    userId: string,
    role: AppRole,
): Promise<void> {
    const { error } = await supabase.from("profiles").insert({ user_id: userId, role });
    if (error) throw new Error(error.message);
}

// ============================================================================
// Reconciliation
// ============================================================================

async function reconcileUser(
    supabase: SupabaseClient,
    user: User,
    profile: ProfileRow | undefined,
    stats: BackfillStats,
): Promise<void> {
    const appRole = extractAppRole(user);
    const label = user.email ?? user.id;

    if (!profile) {
        const targetRole = appRole ?? DEFAULT_ROLE;
        console.warn(`  ⚠️  ${label} — orphan auth.user (no profile). Will create role='${targetRole}'.`);
        try {
            if (APPLY) await createProfile(supabase, user.id, targetRole);
            stats.profilesCreated++;
            if (appRole !== targetRole) {
                if (APPLY) await syncAppMetadataRole(supabase, user, targetRole);
                stats.appMetadataBackfilled++;
            }
        } catch (err) {
            stats.errors++;
            console.error(`     ❌ ${(err as Error).message}`);
        }
        return;
    }

    if (appRole === profile.role) {
        stats.alreadyConsistent++;
        return;
    }

    console.log(
        `  🔄 ${label} — app_metadata.role='${appRole ?? "<missing>"}' → '${profile.role}'`,
    );
    try {
        if (APPLY) await syncAppMetadataRole(supabase, user, profile.role);
        stats.appMetadataBackfilled++;
    } catch (err) {
        stats.errors++;
        console.error(`     ❌ ${(err as Error).message}`);
    }
}

function reportOrphanProfiles(
    profiles: ProfileRow[],
    authUserIds: ReadonlySet<string>,
    stats: BackfillStats,
): void {
    for (const profile of profiles) {
        if (authUserIds.has(profile.user_id)) continue;
        stats.orphanProfilesDetected++;
        console.warn(
            `  ⚠️  Orphan profile detected: user_id=${profile.user_id} role=${profile.role} (no matching auth.users) — manual review required.`,
        );
    }
}

function printReport(stats: BackfillStats): void {
    const mode = APPLY ? "APPLIED" : "DRY-RUN (no writes)";
    console.log(`\n📊 Backfill report — ${mode}`);
    console.log("─".repeat(60));
    console.log(`  auth.users scanned         : ${stats.authUsersScanned}`);
    console.log(`  public.profiles scanned    : ${stats.profilesScanned}`);
    console.log(`  Already consistent         : ${stats.alreadyConsistent}`);
    console.log(`  app_metadata.role updated  : ${stats.appMetadataBackfilled}`);
    console.log(`  profiles created           : ${stats.profilesCreated}`);
    console.log(`  Orphan profiles detected   : ${stats.orphanProfilesDetected}`);
    console.log(`  Errors                     : ${stats.errors}`);
    console.log("─".repeat(60));
    if (!APPLY) {
        console.log("ℹ️  Re-run with --apply to persist changes.");
    }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
    console.log(`🚀 Backfill app_metadata.role — mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);
    console.log(`📡 Target: ${env.NEXT_PUBLIC_SUPABASE_URL}\n`);

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const stats: BackfillStats = {
        authUsersScanned: 0,
        profilesScanned: 0,
        alreadyConsistent: 0,
        appMetadataBackfilled: 0,
        profilesCreated: 0,
        orphanProfilesDetected: 0,
        errors: 0,
    };

    console.log("📥 Fetching auth.users and public.profiles…");
    const [authUsers, profiles] = await Promise.all([
        fetchAllAuthUsers(supabase),
        fetchAllProfiles(supabase),
    ]);
    stats.authUsersScanned = authUsers.length;
    stats.profilesScanned = profiles.length;
    console.log(`   • ${authUsers.length} auth.users, ${profiles.length} profiles\n`);

    const profileByUserId = new Map(profiles.map((p) => [p.user_id, p]));
    const authUserIds = new Set(authUsers.map((u) => u.id));

    console.log("🔁 Reconciling auth.users → app_metadata.role ↔ profiles.role…");
    for (const user of authUsers) {
        await reconcileUser(supabase, user, profileByUserId.get(user.id), stats);
    }

    console.log("\n🔍 Scanning for orphan profiles (profile without auth.user)…");
    reportOrphanProfiles(profiles, authUserIds, stats);

    printReport(stats);
    process.exit(stats.errors > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error(`💥 Fatal: ${(err as Error).message}`);
    process.exit(1);
});

"use server";
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { normalizeRole, isRoleAtLeast } from "./role-helpers";
import type { AppRole } from "./role-helpers";

function readRoleFromMeta(obj: unknown): string {
    if (!obj || typeof obj !== "object") return "";
    const val = (obj as Record<string, unknown>)["role"];
    return typeof val === "string" ? val : "";
}

export async function getCurrentUserRole(): Promise<AppRole> {
    const supabase = await createClient();
    try {
        const { data } = await supabase.auth.getClaims();
        type ClaimsShape = { claims?: Record<string, unknown> };
        const claims = (data as ClaimsShape)?.claims ?? {};
        const meta = claims as Record<string, unknown>;

        // app_metadata is the ONLY trusted source (server-only, signed in JWT).
        // user_metadata is user-modifiable and MUST NOT be used for authorization.
        return normalizeRole(readRoleFromMeta(meta["app_metadata"]));
    } catch (err) {
        console.error("[roles] getCurrentUserRole failed:", err);
        return "user";
    }
}

export async function requireMinRole(requiredRole: AppRole): Promise<void> {
    const role = await getCurrentUserRole();
    if (!isRoleAtLeast(role, requiredRole)) {
        throw new Error(
            `Unauthorized: requires ${requiredRole} role (current: ${role})`,
        );
    }
}

export async function requireBackofficeAccess(): Promise<void> {
    return requireMinRole("editor");
}

export async function requireAdminOnly(): Promise<void> {
    return requireMinRole("admin");
}

export async function requireBackofficePageAccess(): Promise<void> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    const claims = data.claims as Record<string, unknown>;
    const appRole = normalizeRole(readRoleFromMeta(claims["app_metadata"]));

    if (!isRoleAtLeast(appRole, "editor")) {
        redirect("/auth/login");
    }
}

export async function requireAdminPageAccess(): Promise<void> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    const claims = data.claims as Record<string, unknown>;
    const appRole = normalizeRole(readRoleFromMeta(claims["app_metadata"]));

    if (!isRoleAtLeast(appRole, "admin")) {
        redirect("/auth/login");
    }
}

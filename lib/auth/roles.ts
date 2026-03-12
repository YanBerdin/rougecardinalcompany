"use server";
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { normalizeRole, isRoleAtLeast } from "./role-helpers";
import type { AppRole } from "./role-helpers";

export async function getCurrentUserRole(): Promise<AppRole> {
    const supabase = await createClient();
    try {
        const { data } = await supabase.auth.getClaims();
        type ClaimsShape = { claims?: Record<string, unknown> };
        const claims = (data as ClaimsShape)?.claims ?? {};
        const meta = claims as Record<string, unknown>;

        const readRole = (obj: unknown): string => {
            if (!obj || typeof obj !== "object") return "";
            const val = (obj as Record<string, unknown>)["role"];
            return typeof val === "string" ? val : "";
        };

        // app_metadata is the secure source (user cannot modify)
        const appRole = readRole(meta["app_metadata"]);
        if (appRole) return normalizeRole(appRole);

        // Fallback to user_metadata for backward compatibility
        const userRole = readRole(meta["user_metadata"]);
        return normalizeRole(userRole);
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

    const readRole = (obj: unknown): string => {
        if (!obj || typeof obj !== "object") return "";
        const val = (obj as Record<string, unknown>)["role"];
        return typeof val === "string" ? val : "";
    };

    const appRole = normalizeRole(readRole(claims["app_metadata"]));
    const userRole = normalizeRole(readRole(claims["user_metadata"]));

    const effectiveRole = isRoleAtLeast(appRole, userRole) ? appRole : userRole;

    if (!isRoleAtLeast(effectiveRole, "editor")) {
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

    const readRole = (obj: unknown): string => {
        if (!obj || typeof obj !== "object") return "";
        const val = (obj as Record<string, unknown>)["role"];
        return typeof val === "string" ? val : "";
    };

    const appRole = normalizeRole(readRole(claims["app_metadata"]));
    const userRole = normalizeRole(readRole(claims["user_metadata"]));

    const effectiveRole = isRoleAtLeast(appRole, userRole) ? appRole : userRole;

    if (!isRoleAtLeast(effectiveRole, "admin")) {
        redirect("/auth/login");
    }
}

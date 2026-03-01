"use server";
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

/**
 * Return true if current session user is admin.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  try {
    const { data } = await supabase.auth.getClaims();
    type ClaimsShape = { claims?: Record<string, unknown> };
    const claims = (data as ClaimsShape)?.claims ?? {};

    // Helper to safely read nested string claim values
    const getClaimString = (obj: unknown, key: string): string => {
      try {
        const record = obj as Record<string, unknown> | undefined;
        const val = record?.[key];
        return typeof val === "string" ? val : String(val ?? "");
      } catch {
        return "";
      }
    };

    // Check for admin role in app_metadata (secure, cannot be modified by user)
    const appMeta = (claims as Record<string, unknown>)?.["app_metadata"];
    const isAdminFromAppMetadata = getClaimString(appMeta, "role").toLowerCase() === "admin";

    // Fallback: also check user_metadata for backward compatibility
    const userMeta = (claims as Record<string, unknown>)?.["user_metadata"];
    const isAdminFromUserMetadata = getClaimString(userMeta, "role").toLowerCase() === "admin";

    return isAdminFromAppMetadata || isAdminFromUserMetadata
  } catch (err) {
    console.error("isAdmin check failed:", err);
    return false;
  }
}

/**
 * Require admin, throw if not.
 */
export async function requireAdmin(): Promise<void> {
  const ok = await isAdmin();
  if (!ok) throw new Error("Unauthorized: admin required");
}

/**
 * Guard for admin Server Component pages.
 *
 * Checks `app_metadata.role` (secure, user cannot modify) first,
 * then falls back to `user_metadata.role` for backward compatibility.
 * Redirects to /auth/login if not authenticated or not admin.
 *
 * @example
 * await requireAdminPageAccess();
 */
export async function requireAdminPageAccess(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const claims = data.claims as Record<string, unknown>;

  const getRole = (meta: unknown): string => {
    if (!meta || typeof meta !== "object") return "";
    const val = (meta as Record<string, unknown>)["role"];
    return typeof val === "string" ? val.toLowerCase() : "";
  };

  const isAdminByAppMeta = getRole(claims["app_metadata"]) === "admin";
  const isAdminByUserMeta = getRole(claims["user_metadata"]) === "admin";

  if (!isAdminByAppMeta && !isAdminByUserMeta) {
    redirect("/auth/login");
  }
}

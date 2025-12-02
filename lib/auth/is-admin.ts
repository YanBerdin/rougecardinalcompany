"use server";
import "server-only";
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

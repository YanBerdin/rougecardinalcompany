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
    const claims = (data as any)?.claims ?? {};

    // Whitelist of claim paths to check for an admin role.
    // Check several common locations where role may appear.
    const isAdminFromTop = String(claims.role ?? "").toLowerCase() === "admin";
    const isAdminFromUserMetadata =
      String(claims?.user_metadata?.role ?? "").toLowerCase() === "admin";
    const isAdminFromAppMetadata =
      String(claims?.app_metadata?.role ?? "").toLowerCase() === "admin";
    // Common JWT claim used by Hasura or similar setups
    /*
    const hasuraClaims =
      claims?.["https://hasura.io/jwt/claims"] ?? claims?.hasura ?? null;
    const isAdminFromHasura =
      Boolean(hasuraClaims) &&
      String(
        hasuraClaims?.["x-hasura-role"] ?? hasuraClaims?.["x-hasura-role"] ?? ""
      ).toLowerCase() === "admin";
      */
    // || isAdminFromHasura ||
    return isAdminFromTop || isAdminFromUserMetadata || isAdminFromAppMetadata;
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

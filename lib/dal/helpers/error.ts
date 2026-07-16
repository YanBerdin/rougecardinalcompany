/**
 * Error handling utilities for DAL functions
 * @module lib/dal/helpers/error
 */

import type { HttpStatusCode } from "@/lib/api/helpers";

// ============================================================================
// Types
// ============================================================================

export type DALSuccess<T> = { readonly success: true; readonly data: T };
export type DALError = {
    readonly success: false;
    readonly error: string;
    readonly status?: HttpStatusCode;
};
export type DALResult<T> = DALSuccess<T> | DALError;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely extract error message from unknown error types
 *
 * Handles Error instances, objects with message property, and fallback cases.
 *
 * @param err - Unknown error value
 * @returns Human-readable error message
 *
 * @example
 * getErrorMessage(new Error("fail")) // "fail"
 * getErrorMessage({ message: "oops" }) // "oops"
 * getErrorMessage("string error") // "string error"
 */
export function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) {
        const maybe = (err as { message?: unknown }).message;
        if (typeof maybe === "string") return maybe;
    }
    try {
        return JSON.stringify(err);
    } catch {
        return String(err);
    }
}

/**
 * Create a success result
 */
export function dalSuccess<T>(data: T): DALSuccess<T> {
    return { success: true, data };
}

/**
 * Create an error result
 */
export function dalError(error: string, status?: HttpStatusCode): DALError {
    return status ? { success: false, error, status } : { success: false, error };
}

/**
 * Detect Next.js internal "Dynamic server usage" control-flow error
 * (thrown when `cookies()`/`headers()` are used while Next attempts to
 * statically render a route, e.g. during `revalidate`-based ISR builds).
 *
 * This error must NEVER be swallowed: catch blocks in DAL functions must
 * rethrow it so Next.js can correctly mark the route as dynamic instead of
 * silently caching an empty/fallback result at build time.
 *
 * @see https://nextjs.org/docs/messages/dynamic-server-error
 *
 * @example
 * try {
 *   const supabase = await createClient();
 *   // ...
 * } catch (err) {
 *   if (isDynamicServerError(err)) throw err;
 *   console.error("fetchThing exception:", err);
 *   return null;
 * }
 */
export function isDynamicServerError(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "digest" in err &&
        (err as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
    );
}

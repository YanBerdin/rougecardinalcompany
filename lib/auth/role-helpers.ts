/**
 * @file Pure role helpers — safe for Client and Server Components
 * @description Contains type definitions, role hierarchy, and pure functions
 *              that can be imported from both client and server code.
 */

export type AppRole = "user" | "editor" | "admin";

export const ROLE_HIERARCHY: Record<AppRole, number> = {
    user: 0,
    editor: 1,
    admin: 2,
} as const;

const VALID_ROLES = new Set<string>(Object.keys(ROLE_HIERARCHY));

export function normalizeRole(raw: unknown): AppRole {
    if (typeof raw !== "string") return "user";
    const lower = raw.toLowerCase();
    return VALID_ROLES.has(lower) ? (lower as AppRole) : "user";
}

export function isRoleAtLeast(
    userRole: AppRole,
    requiredRole: AppRole,
): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

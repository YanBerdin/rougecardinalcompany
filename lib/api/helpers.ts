import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/is-admin";

/**
 * HTTP status codes as constants
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/**
 * PostgreSQL error codes
 */
export const PostgresError = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
} as const;

/**
 * Type-safe response helpers
 */
export const ApiResponse = {
  success: <T>(data: T, status: HttpStatusCode = HttpStatus.OK) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  error: (message: string, status: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR) => {
    return NextResponse.json({ error: message }, { status });
  },

  validationError: (details: unknown) => {
    return NextResponse.json(
      { error: "Validation failed", details },
      { status: HttpStatus.UNPROCESSABLE_ENTITY }
    );
  },
};

/**
 * Parse numeric ID from string parameter
 * Rejects decimal numbers and non-positive integers
 */
export function parseNumericId(id: string): number | null {
  // Reject decimal numbers
  if (id.includes(".")) {
    return null;
  }

  const parsed = parseInt(id, 10);

  // Verify it's a valid positive integer and the string representation matches
  if (isNaN(parsed) || parsed <= 0 || parsed.toString() !== id) {
    return null;
  }

  return parsed;
}

/**
 * Parse boolean from various input types
 */
export function parseBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  return null;
}

/**
 * Wrapper for protected routes requiring admin access
 */
export async function withAdminAuth<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    await requireAdmin();
    return await handler();
  } catch (error: unknown) {
    console.error("[API] Auth error:", error);
    return ApiResponse.error("Forbidden", HttpStatus.FORBIDDEN);
  }
}

/**
 * Parse full name into first and last name
 */
export function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 0) {
    return { firstName: trimmed, lastName: trimmed };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || firstName;

  return { firstName, lastName };
}

/**
 * Check if error is a Postgres unique constraint violation
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === PostgresError.UNIQUE_VIOLATION
  );
}

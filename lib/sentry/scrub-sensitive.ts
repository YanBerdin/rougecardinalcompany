import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

const SENSITIVE_HEADERS = ["authorization", "cookie", "x-api-key"] as const;

const SESSION_SECRET_PATTERNS: readonly RegExp[] = [
    /sb-[a-z0-9-]+-auth-token/i,
    /\bcookie\b/i,
    /\bbearer\s+\S+/i,
    /access_token/i,
    /refresh_token/i,
];

// Scrub sensitive headers and drop console breadcrumbs containing session secrets to prevent leaking tokens in Sentry events.
export function scrubSensitiveHeaders(event: ErrorEvent): ErrorEvent {
    if (!event.request?.headers) return event;
    const headers = { ...event.request.headers };
    for (const name of SENSITIVE_HEADERS) delete headers[name];
    event.request.headers = headers;
    return event;
}

//? Note: This approach assumes that sensitive information may appear in headers or console logs. It aims to prevent accidental exposure of session secrets, tokens, or other sensitive data in Sentry events by scrubbing headers and dropping potentially sensitive console breadcrumbs.
export function dropSensitiveConsoleBreadcrumb(
    breadcrumb: Breadcrumb
): Breadcrumb | null {
    if (breadcrumb.category !== "console") return breadcrumb;
    try {
        const serialized = JSON.stringify([breadcrumb.message, breadcrumb.data]);
        return SESSION_SECRET_PATTERNS.some((pattern) => pattern.test(serialized))
            ? null
            : breadcrumb;
    } catch {
        // Unserializable payload: drop it rather than risk leaking a token.
        return null;
    }
}

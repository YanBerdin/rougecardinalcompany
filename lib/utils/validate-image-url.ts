"use server";

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
] as const;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

function isAllowedMimeType(mime: string): mime is AllowedMimeType {
    return ALLOWED_MIME_TYPES.includes(mime as AllowedMimeType);
}

/**
 * Allowed hostname patterns for image URLs.
 * This prevents SSRF attacks by restricting requests to trusted domains only.
 */
const ALLOWED_HOSTNAME_PATTERNS = [
    // Supabase Storage (project-specific)
    /^[a-z0-9]+\.supabase\.co$/,
    // Supabase Storage (generic)
    /^supabase\.co$/,
    // Local development
    /^localhost$/,
    /^127\.0\.0\.1$/,
] as const;

/**
 * Blocked IP ranges to prevent SSRF to internal networks.
 * Even if hostname validation passes, we block private/internal IPs.
 */
const BLOCKED_IP_PATTERNS = [
    // Loopback (when not in development)
    /^127\./,
    // Private networks
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    // Link-local
    /^169\.254\./,
    // IPv6 loopback and private
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^fd00:/i,
] as const;

/**
 * Validates that a URL hostname is allowed for image fetching.
 * Prevents SSRF attacks by restricting to trusted domains.
 */
function isAllowedHostname(hostname: string): boolean {
    // In development, allow localhost
    const isDev = process.env.NODE_ENV === "development";

    // Block internal IPs (except localhost in dev)
    if (!isDev) {
        for (const pattern of BLOCKED_IP_PATTERNS) {
            if (pattern.test(hostname)) {
                return false;
            }
        }
    }

    // Check against allowed hostname patterns
    for (const pattern of ALLOWED_HOSTNAME_PATTERNS) {
        if (pattern.test(hostname)) {
            return true;
        }
    }

    return false;
}

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
    mime?: AllowedMimeType;
    size?: number;
}

export async function validateImageUrl(
    url: string
): Promise<ImageValidationResult> {
    try {
        // Parse and validate URL structure
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return {
                valid: false,
                error: "Invalid URL format",
            };
        }

        // Only allow HTTPS (and HTTP in development)
        const allowedProtocols =
            process.env.NODE_ENV === "development"
                ? ["https:", "http:"]
                : ["https:"];

        if (!allowedProtocols.includes(parsedUrl.protocol)) {
            return {
                valid: false,
                error: `Invalid protocol: ${parsedUrl.protocol}. Only HTTPS allowed.`,
            };
        }

        // SSRF Prevention: Validate hostname against allowlist
        if (!isAllowedHostname(parsedUrl.hostname)) {
            return {
                valid: false,
                error: `Hostname not allowed: ${parsedUrl.hostname}. Only Supabase Storage URLs are permitted.`,
            };
        }

        // Safe to fetch: hostname is validated against allowlist
        const response = await fetch(url, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
            redirect: "error", // Prevent redirect-based SSRF
        });

        if (!response.ok) {
            return {
                valid: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const contentType = response.headers.get("content-type");
        if (
            !contentType ||
            !isAllowedMimeType(contentType.split(";")[0].trim())
        ) {
            return {
                valid: false,
                error: `Invalid image type: ${contentType}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
            };
        }

        const contentLength = response.headers.get("content-length");
        const size = contentLength ? parseInt(contentLength, 10) : undefined;

        return {
            valid: true,
            mime: contentType.split(";")[0].trim() as AllowedMimeType,
            size,
        };
    } catch (error: unknown) {
        return {
            valid: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown validation error",
        };
    }
}

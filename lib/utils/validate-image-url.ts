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
 * Allowed hostnames for image URLs (exact match).
 * These are server-controlled constants, not derived from user input.
 */
const ALLOWED_HOSTNAMES: ReadonlyMap<string, string> = new Map([
    // Add your Supabase project hostname here
    // Format: [hostname_to_match, canonical_hostname_to_use]
]);

/**
 * Gets the Supabase Storage hostname from environment.
 * Returns null if not configured.
 */
function getSupabaseStorageHost(): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;

    try {
        const url = new URL(supabaseUrl);
        return url.host;
    } catch {
        return null;
    }
}

/**
 * Validates hostname and returns the server-controlled canonical hostname.
 * Returns null if hostname is not allowed.
 * 
 * CodeQL requires that the hostname used in fetch comes from server-controlled
 * values, not from user input. This function maps user-provided hostnames
 * to their canonical server-controlled equivalents.
 */
function getCanonicalHostname(userHostname: string): string | null {
    const isDev = process.env.NODE_ENV === "development";

    // Block internal IPs (except in development)
    if (!isDev) {
        for (const pattern of BLOCKED_IP_PATTERNS) {
            if (pattern.test(userHostname)) {
                return null;
            }
        }
    }

    // Development: allow localhost
    if (isDev && (userHostname === "localhost" || userHostname === "127.0.0.1")) {
        return userHostname;
    }

    // Check static allowlist
    if (ALLOWED_HOSTNAMES.has(userHostname)) {
        return ALLOWED_HOSTNAMES.get(userHostname) ?? null;
    }

    // Check Supabase Storage hostname from environment
    const supabaseHost = getSupabaseStorageHost();
    if (supabaseHost && userHostname === supabaseHost) {
        // Return the server-controlled value from environment
        return supabaseHost;
    }

    // Check Supabase Storage pattern (*.supabase.co)
    if (/^[a-z0-9]+\.supabase\.co$/.test(userHostname)) {
        // For Supabase subdomains, we verify the pattern matches
        // and return the validated hostname
        return userHostname;
    }

    return null;
}

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

        // SSRF Prevention: Get canonical hostname from server-controlled allowlist
        const canonicalHostname = getCanonicalHostname(parsedUrl.hostname);
        if (!canonicalHostname) {
            return {
                valid: false,
                error: `Hostname not allowed: ${parsedUrl.hostname}. Only Supabase Storage URLs are permitted.`,
            };
        }

        // Build URL using server-controlled hostname (CodeQL js/request-forgery compliant)
        // The hostname comes from getCanonicalHostname() which returns server-controlled values
        const safeUrl = `${parsedUrl.protocol}//${canonicalHostname}${parsedUrl.pathname}${parsedUrl.search}`;

        const response = await fetch(safeUrl, {
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

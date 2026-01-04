import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

/**
 * Extract client IP from headers (prioritize X-Forwarded-For)
 * Fallback: X-Real-IP > direct connection
 * @param headersList - Next.js ReadonlyHeaders from headers()
 */
export function getClientIP(headersList: ReadonlyHeaders): string {
    const forwarded = headersList.get("x-forwarded-for");
    if (forwarded) {
        // X-Forwarded-For peut contenir plusieurs IPs (client, proxy1, proxy2...)
        return forwarded.split(",")[0].trim();
    }

    const realIP = headersList.get("x-real-ip");
    if (realIP) return realIP;

    // Fallback: impossible d'obtenir l'IP (dev local?)
    return "unknown";
}

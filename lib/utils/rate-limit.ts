/**
 * Simple in-memory rate limiter
 * Production: Replace with Redis or dedicated rate limiting service
 */

interface RateLimitEntry {
    timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up old timestamps (older than window)
 */
function cleanupOldTimestamps(
    timestamps: number[],
    windowMs: number
): number[] {
    const now = Date.now();
    return timestamps.filter((ts) => now - ts < windowMs);
}

/**
 * Check if rate limit is exceeded
 * 
 * @param key - Unique identifier (e.g., user_id, IP address)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();

    // Get or create entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        rateLimitStore.set(key, entry);
    }

    // Cleanup old timestamps
    entry.timestamps = cleanupOldTimestamps(entry.timestamps, windowMs);

    // Check if limit exceeded
    const currentCount = entry.timestamps.length;
    const allowed = currentCount < maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount);

    // Calculate reset time (oldest timestamp + window)
    const oldestTimestamp = entry.timestamps[0] ?? now;
    const resetAt = new Date(oldestTimestamp + windowMs);

    return { allowed, remaining, resetAt };
}

/**
 * Record a request (increment counter)
 * 
 * @param key - Unique identifier
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Success status and remaining requests
 */
export function recordRequest(
    key: string,
    maxRequests: number,
    windowMs: number
): { success: boolean; remaining: number; resetAt: Date } {
    const { allowed, remaining, resetAt } = checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
        return { success: false, remaining: 0, resetAt };
    }

    // Add timestamp
    const entry = rateLimitStore.get(key)!;
    entry.timestamps.push(Date.now());

    return {
        success: true,
        remaining: remaining - 1,
        resetAt
    };
}

/**
 * Reset rate limit for a specific key (for testing)
 */
export function resetRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

/**
 * Cleanup all expired entries (run periodically)
 */
export function cleanupExpiredEntries(windowMs: number): void {
    const now = Date.now();

    for (const [key, entry] of rateLimitStore.entries()) {
        entry.timestamps = cleanupOldTimestamps(entry.timestamps, windowMs);

        // Remove entry if no timestamps left
        if (entry.timestamps.length === 0) {
            rateLimitStore.delete(key);
        }
    }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        cleanupExpiredEntries(60 * 60 * 1000); // 1 hour window
    }, 5 * 60 * 1000); // Every 5 minutes
}

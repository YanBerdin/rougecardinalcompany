import { afterEach, describe, expect, it } from "vitest";

import {
    checkRateLimit,
    cleanupExpiredEntries,
    recordRequest,
    resetRateLimit,
} from "@/lib/utils/rate-limit";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

let keyCounter = 0;

/** Each test uses its own key: the store is a module-level singleton. */
function uniqueKey(): string {
    keyCounter += 1;
    return `test-key-${keyCounter}`;
}

afterEach(() => {
    cleanupExpiredEntries(0);
});

describe("checkRateLimit", () => {
    it("allows the first request of an unknown key", () => {
        const result = checkRateLimit(uniqueKey(), MAX_REQUESTS, WINDOW_MS);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(MAX_REQUESTS);
    });

    it("does not consume quota (read-only)", () => {
        const key = uniqueKey();

        checkRateLimit(key, MAX_REQUESTS, WINDOW_MS);
        checkRateLimit(key, MAX_REQUESTS, WINDOW_MS);

        expect(checkRateLimit(key, MAX_REQUESTS, WINDOW_MS).remaining).toBe(
            MAX_REQUESTS
        );
    });
});

describe("recordRequest", () => {
    it("decrements the remaining quota on each call", () => {
        const key = uniqueKey();

        expect(recordRequest(key, MAX_REQUESTS, WINDOW_MS).remaining).toBe(2);
        expect(recordRequest(key, MAX_REQUESTS, WINDOW_MS).remaining).toBe(1);
        expect(recordRequest(key, MAX_REQUESTS, WINDOW_MS).remaining).toBe(0);
    });

    it("rejects requests once the limit is reached", () => {
        const key = uniqueKey();

        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            expect(recordRequest(key, MAX_REQUESTS, WINDOW_MS).success).toBe(true);
        }

        const blocked = recordRequest(key, MAX_REQUESTS, WINDOW_MS);
        expect(blocked.success).toBe(false);
        expect(blocked.remaining).toBe(0);
    });

    it("isolates quotas between distinct keys", () => {
        const first = uniqueKey();
        const second = uniqueKey();

        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            recordRequest(first, MAX_REQUESTS, WINDOW_MS);
        }

        expect(recordRequest(first, MAX_REQUESTS, WINDOW_MS).success).toBe(false);
        expect(recordRequest(second, MAX_REQUESTS, WINDOW_MS).success).toBe(true);
    });

    it("allows requests again once the window has elapsed", () => {
        const key = uniqueKey();
        const expiredWindowMs = 0;

        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            recordRequest(key, MAX_REQUESTS, WINDOW_MS);
        }

        expect(recordRequest(key, MAX_REQUESTS, expiredWindowMs).success).toBe(
            true
        );
    });

    it("exposes a resetAt date inside the window", () => {
        const key = uniqueKey();
        const before = Date.now();

        const { resetAt } = recordRequest(key, MAX_REQUESTS, WINDOW_MS);

        expect(resetAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(resetAt.getTime()).toBeLessThanOrEqual(Date.now() + WINDOW_MS);
    });
});

describe("resetRateLimit", () => {
    it("clears the quota consumed by a key", () => {
        const key = uniqueKey();

        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            recordRequest(key, MAX_REQUESTS, WINDOW_MS);
        }
        expect(recordRequest(key, MAX_REQUESTS, WINDOW_MS).success).toBe(false);

        resetRateLimit(key);

        expect(recordRequest(key, MAX_REQUESTS, WINDOW_MS).success).toBe(true);
    });
});

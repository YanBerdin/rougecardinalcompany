import { describe, it, expect } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import {
    dropSensitiveConsoleBreadcrumb,
    scrubSensitiveHeaders,
} from "@/lib/sentry/scrub-sensitive";

describe("dropSensitiveConsoleBreadcrumb", () => {
    it("drops a console breadcrumb containing a Supabase session cookie", () => {
        const breadcrumb = {
            category: "console",
            message: "Middleware",
            data: { arguments: ["sb-abcd-auth-token=base64-eyJ..."] },
        };
        expect(dropSensitiveConsoleBreadcrumb(breadcrumb)).toBeNull();
    });

    it("drops a console breadcrumb mentioning a refresh token", () => {
        const breadcrumb = { category: "console", message: '{"refresh_token":"x"}' };
        expect(dropSensitiveConsoleBreadcrumb(breadcrumb)).toBeNull();
    });

    it("keeps a harmless console breadcrumb", () => {
        const breadcrumb = { category: "console", message: "Spectacle saved" };
        expect(dropSensitiveConsoleBreadcrumb(breadcrumb)).toBe(breadcrumb);
    });

    it("keeps non-console breadcrumbs untouched", () => {
        const breadcrumb = { category: "navigation", message: "cookie page" };
        expect(dropSensitiveConsoleBreadcrumb(breadcrumb)).toBe(breadcrumb);
    });
});

describe("scrubSensitiveHeaders", () => {
    it("removes cookie, authorization and x-api-key headers", () => {
        const event = {
            type: undefined,
            request: {
                headers: { cookie: "sb=1", authorization: "Bearer x", "x-api-key": "k", accept: "*/*" },
            },
        } as ErrorEvent;
        expect(scrubSensitiveHeaders(event).request?.headers).toEqual({ accept: "*/*" });
    });
});

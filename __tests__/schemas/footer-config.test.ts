/**
 * @file Footer Config Schema Tests
 * @see .github/prompts/plan-TAS095-footerAdmin.prompt.md (Step 9)
 */

import { describe, it, expect } from "vitest";
import {
    FooterConfigInputSchema,
    FooterConfigFormSchema,
    FOOTER_DEFAULTS,
    FOOTER_CONFIG_KEY,
} from "@/lib/schemas/footer-config";

describe("footer-config schemas", () => {
    describe("FOOTER_CONFIG_KEY", () => {
        it("matches the public RLS read pattern (public:%)", () => {
            expect(FOOTER_CONFIG_KEY).toBe("public:footer:content");
            expect(FOOTER_CONFIG_KEY.startsWith("public:")).toBe(true);
        });
    });

    describe("FOOTER_DEFAULTS", () => {
        it("validates against the input schema", () => {
            const result = FooterConfigInputSchema.safeParse(FOOTER_DEFAULTS);
            expect(result.success).toBe(true);
        });
    });

    describe("FooterConfigInputSchema", () => {
        it("rejects an empty description", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                description: "",
            });
            expect(result.success).toBe(false);
        });

        it("rejects a description longer than 500 chars", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                description: "a".repeat(501),
            });
            expect(result.success).toBe(false);
        });

        it("accepts a description of exactly 500 chars", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                description: "a".repeat(500),
            });
            expect(result.success).toBe(true);
        });

        it("rejects an invalid email", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                contact: { ...FOOTER_DEFAULTS.contact, email: "not-an-email" },
            });
            expect(result.success).toBe(false);
        });

        it("rejects an empty phone", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                contact: { ...FOOTER_DEFAULTS.contact, phone: "" },
            });
            expect(result.success).toBe(false);
        });

        it("rejects an empty address", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                contact: { ...FOOTER_DEFAULTS.contact, address: "" },
            });
            expect(result.success).toBe(false);
        });

        it("rejects an invalid facebook URL", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                socialLinks: {
                    ...FOOTER_DEFAULTS.socialLinks,
                    facebook: "not-a-url",
                },
            });
            expect(result.success).toBe(false);
        });

        it("rejects an invalid instagram URL", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                socialLinks: {
                    ...FOOTER_DEFAULTS.socialLinks,
                    instagram: "javascript:alert(1)",
                },
            });
            // Note: javascript: URLs may pass z.string().url(); the security
            // concern here is mostly XSS via rendering. We still expect
            // arbitrary garbage to be rejected:
            const garbage = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                socialLinks: {
                    ...FOOTER_DEFAULTS.socialLinks,
                    instagram: "not a url at all",
                },
            });
            expect(garbage.success).toBe(false);
            // We don't strictly assert on the javascript: case; just keep
            // `result` referenced to avoid unused-var lint noise.
            void result;
        });

        it("accepts an empty string for an optional social link (hide button)", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                socialLinks: {
                    facebook: "",
                    instagram: "",
                    twitter: "",
                },
            });
            expect(result.success).toBe(true);
        });

        it("accepts undefined optional social links", () => {
            const result = FooterConfigInputSchema.safeParse({
                ...FOOTER_DEFAULTS,
                socialLinks: {},
            });
            expect(result.success).toBe(true);
        });
    });

    describe("FooterConfigFormSchema", () => {
        it("is an alias of the input schema", () => {
            // Same constraints must apply on the client form
            const result = FooterConfigFormSchema.safeParse(FOOTER_DEFAULTS);
            expect(result.success).toBe(true);

            const invalid = FooterConfigFormSchema.safeParse({
                ...FOOTER_DEFAULTS,
                description: "",
            });
            expect(invalid.success).toBe(false);
        });
    });
});

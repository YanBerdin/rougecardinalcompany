import { describe, expect, it } from "vitest";

import { NewsletterSubscriptionSchema } from "@/lib/schemas/newsletter";

describe("NewsletterSubscriptionSchema", () => {
    it("accepts a valid email and applies defaults", () => {
        const parsed = NewsletterSubscriptionSchema.parse({
            email: "abonne@example.com",
        });

        expect(parsed.consent).toBe(true);
        expect(parsed.source).toBe("website");
    });

    it("keeps an explicit source", () => {
        const parsed = NewsletterSubscriptionSchema.parse({
            email: "abonne@example.com",
            source: "footer",
        });

        expect(parsed.source).toBe("footer");
    });

    it("rejects an invalid email", () => {
        expect(
            NewsletterSubscriptionSchema.safeParse({ email: "abonne@" }).success
        ).toBe(false);
        expect(
            NewsletterSubscriptionSchema.safeParse({ email: "" }).success
        ).toBe(false);
    });

    it("rejects a missing email", () => {
        expect(NewsletterSubscriptionSchema.safeParse({}).success).toBe(false);
    });
});

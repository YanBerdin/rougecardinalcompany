import { describe, expect, it } from "vitest";

import { ContactMessageSchema } from "@/lib/schemas/contact";

const validPayload = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "Jean.Dupont@Example.COM",
    reason: "booking",
    message: "Bonjour, je souhaite programmer votre spectacle.",
    consent: true,
};

describe("ContactMessageSchema", () => {
    it("accepts a valid submission and normalizes the email to lowercase", () => {
        const parsed = ContactMessageSchema.parse(validPayload);

        expect(parsed.email).toBe("jean.dupont@example.com");
        expect(parsed.reason).toBe("booking");
    });

    it("defaults the reason to 'autre' when omitted", () => {
        const { reason: _reason, ...withoutReason } = validPayload;

        expect(ContactMessageSchema.parse(withoutReason).reason).toBe("autre");
    });

    it("rejects a submission without RGPD consent", () => {
        const result = ContactMessageSchema.safeParse({
            ...validPayload,
            consent: false,
        });

        expect(result.success).toBe(false);
    });

    it("rejects an invalid email", () => {
        const result = ContactMessageSchema.safeParse({
            ...validPayload,
            email: "not-an-email",
        });

        expect(result.success).toBe(false);
    });

    it("rejects a message shorter than 10 characters", () => {
        const result = ContactMessageSchema.safeParse({
            ...validPayload,
            message: "court",
        });

        expect(result.success).toBe(false);
    });

    it("rejects a message longer than 5000 characters", () => {
        const result = ContactMessageSchema.safeParse({
            ...validPayload,
            message: "a".repeat(5001),
        });

        expect(result.success).toBe(false);
    });

    it("rejects an empty first or last name", () => {
        expect(
            ContactMessageSchema.safeParse({ ...validPayload, firstName: "   " })
                .success
        ).toBe(false);
        expect(
            ContactMessageSchema.safeParse({ ...validPayload, lastName: "" })
                .success
        ).toBe(false);
    });

    it("rejects a malformed phone number but accepts an international one", () => {
        expect(
            ContactMessageSchema.safeParse({ ...validPayload, phone: "12" })
                .success
        ).toBe(false);
        expect(
            ContactMessageSchema.safeParse({
                ...validPayload,
                phone: "+33 6 12 34 56 78",
            }).success
        ).toBe(true);
    });

    it("rejects an unknown contact reason", () => {
        const result = ContactMessageSchema.safeParse({
            ...validPayload,
            reason: "spam",
        });

        expect(result.success).toBe(false);
    });
});

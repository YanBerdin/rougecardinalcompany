/**
 * @file Auth password schema tests
 * @see .github/prompts/plan-TASK096-hardenAuthRoleSecurity.prompt.md (Phase 5)
 *
 * Vérifie que PasswordSchema applique OWASP ASVS L2 :
 *  - longueur minimale 12 caractères
 *  - 4 classes (minuscule, majuscule, chiffre, symbole)
 * et que PasswordWithConfirmationSchema rejette les mots de passe non identiques.
 */

import { describe, it, expect } from "vitest";
import {
    PasswordSchema,
    PasswordWithConfirmationSchema,
} from "@/lib/schemas/auth";

describe("PasswordSchema", () => {
    const VALID_PASSWORD = "Str0ngPass!word";

    it("accepts a password meeting all rules", () => {
        const result = PasswordSchema.safeParse(VALID_PASSWORD);
        expect(result.success).toBe(true);
    });

    it("rejects a password shorter than 12 characters", () => {
        const result = PasswordSchema.safeParse("Ab1!short");
        expect(result.success).toBe(false);
    });

    it("rejects a password without uppercase", () => {
        const result = PasswordSchema.safeParse("str0ngpass!word");
        expect(result.success).toBe(false);
    });

    it("rejects a password without lowercase", () => {
        const result = PasswordSchema.safeParse("STR0NGPASS!WORD");
        expect(result.success).toBe(false);
    });

    it("rejects a password without digit", () => {
        const result = PasswordSchema.safeParse("StrongPass!word");
        expect(result.success).toBe(false);
    });

    it("rejects a password without special character", () => {
        const result = PasswordSchema.safeParse("Str0ngPassword1");
        expect(result.success).toBe(false);
    });

    it("aggregates multiple violations in a single parse", () => {
        const result = PasswordSchema.safeParse("password");
        expect(result.success).toBe(false);
        if (!result.success) {
            // length + uppercase + digit + symbol = 4 issues
            expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
        }
    });
});

describe("PasswordWithConfirmationSchema", () => {
    const VALID_PASSWORD = "Str0ngPass!word";

    it("accepts matching passwords", () => {
        const result = PasswordWithConfirmationSchema.safeParse({
            password: VALID_PASSWORD,
            confirmPassword: VALID_PASSWORD,
        });
        expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords with confirmPassword path", () => {
        const result = PasswordWithConfirmationSchema.safeParse({
            password: VALID_PASSWORD,
            confirmPassword: `${VALID_PASSWORD}X`,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const hasConfirmIssue = result.error.issues.some((issue) =>
                issue.path.includes("confirmPassword"),
            );
            expect(hasConfirmIssue).toBe(true);
        }
    });

    it("propagates PasswordSchema violations on the password field", () => {
        const result = PasswordWithConfirmationSchema.safeParse({
            password: "weak",
            confirmPassword: "weak",
        });
        expect(result.success).toBe(false);
    });
});

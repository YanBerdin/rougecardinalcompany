import { describe, it, expect } from "vitest";
import {
    normalizeRole,
    isRoleAtLeast,
    ROLE_HIERARCHY,
} from "@/lib/auth/role-helpers";
import type { AppRole } from "@/lib/auth/role-helpers";

// ---------------------------------------------------------------------------
// 2.1 — normalizeRole()
// ---------------------------------------------------------------------------
describe("normalizeRole", () => {
    it("ROLE-UNIT-001 — normalizeRole admin", () => {
        expect(normalizeRole("admin")).toBe("admin");
    });

    it("ROLE-UNIT-002 — normalizeRole editor", () => {
        expect(normalizeRole("editor")).toBe("editor");
    });

    it("ROLE-UNIT-003 — normalizeRole user", () => {
        expect(normalizeRole("user")).toBe("user");
    });

    it("ROLE-UNIT-004 — normalizeRole majuscules ADMIN", () => {
        expect(normalizeRole("ADMIN")).toBe("admin");
    });

    it("ROLE-UNIT-005 — normalizeRole casse mixte Editor", () => {
        expect(normalizeRole("Editor")).toBe("editor");
    });

    it("ROLE-UNIT-006 — normalizeRole rôle inconnu fallback user", () => {
        expect(normalizeRole("superadmin")).toBe("user");
    });

    it("ROLE-UNIT-007 — normalizeRole chaîne vide fallback user", () => {
        expect(normalizeRole("")).toBe("user");
    });

    it("ROLE-UNIT-008 — normalizeRole null fallback user", () => {
        expect(normalizeRole(null)).toBe("user");
    });

    it("ROLE-UNIT-009 — normalizeRole undefined fallback user", () => {
        expect(normalizeRole(undefined)).toBe("user");
    });

    it("ROLE-UNIT-010 — normalizeRole nombre fallback user", () => {
        expect(normalizeRole(42)).toBe("user");
    });

    it("ROLE-UNIT-011 — normalizeRole objet fallback user", () => {
        expect(normalizeRole({})).toBe("user");
    });
});

// ---------------------------------------------------------------------------
// 2.2 — isRoleAtLeast()
// ---------------------------------------------------------------------------
describe("isRoleAtLeast", () => {
    it("ROLE-UNIT-012 — admin >= admin", () => {
        expect(isRoleAtLeast("admin", "admin")).toBe(true);
    });

    it("ROLE-UNIT-013 — admin >= editor", () => {
        expect(isRoleAtLeast("admin", "editor")).toBe(true);
    });

    it("ROLE-UNIT-014 — admin >= user", () => {
        expect(isRoleAtLeast("admin", "user")).toBe(true);
    });

    it("ROLE-UNIT-015 — editor >= editor", () => {
        expect(isRoleAtLeast("editor", "editor")).toBe(true);
    });

    it("ROLE-UNIT-016 — editor >= user", () => {
        expect(isRoleAtLeast("editor", "user")).toBe(true);
    });

    it("ROLE-UNIT-017 — editor < admin", () => {
        expect(isRoleAtLeast("editor", "admin")).toBe(false);
    });

    it("ROLE-UNIT-018 — user >= user", () => {
        expect(isRoleAtLeast("user", "user")).toBe(true);
    });

    it("ROLE-UNIT-019 — user < editor", () => {
        expect(isRoleAtLeast("user", "editor")).toBe(false);
    });

    it("ROLE-UNIT-020 — user < admin", () => {
        expect(isRoleAtLeast("user", "admin")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// 2.3 — ROLE_HIERARCHY
// ---------------------------------------------------------------------------
describe("ROLE_HIERARCHY", () => {
    it("ROLE-UNIT-021 — user = 0", () => {
        expect(ROLE_HIERARCHY["user"]).toBe(0);
    });

    it("ROLE-UNIT-022 — editor = 1", () => {
        expect(ROLE_HIERARCHY["editor"]).toBe(1);
    });

    it("ROLE-UNIT-023 — admin = 2", () => {
        expect(ROLE_HIERARCHY["admin"]).toBe(2);
    });

    it("ROLE-UNIT-024 — ordre strict user < editor < admin", () => {
        const roles: AppRole[] = ["user", "editor", "admin"];
        const values = roles.map((r) => ROLE_HIERARCHY[r]);

        expect(values[0]).toBeLessThan(values[1]);
        expect(values[1]).toBeLessThan(values[2]);
    });
});

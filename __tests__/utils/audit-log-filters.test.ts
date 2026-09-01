import { describe, expect, it } from "vitest";

import { parseAuditLogFilters } from "@/lib/utils/audit-log-filters";

const VALID_UUID = "3f9a1c2e-4b5d-4e6f-8a7b-9c0d1e2f3a4b";

describe("parseAuditLogFilters", () => {
    it("applies pagination defaults when searchParams are empty", () => {
        const filters = parseAuditLogFilters({});

        expect(filters.page).toBe(1);
        expect(filters.limit).toBe(50);
        expect(filters.action).toBeUndefined();
        expect(filters.table_name).toBeUndefined();
    });

    it("coerces numeric query strings", () => {
        const filters = parseAuditLogFilters({ page: "3", limit: "25" });

        expect(filters.page).toBe(3);
        expect(filters.limit).toBe(25);
    });

    it("coerces date query strings to Date objects", () => {
        const filters = parseAuditLogFilters({
            date_from: "2026-01-01",
            date_to: "2026-01-31",
        });

        expect(filters.date_from).toBeInstanceOf(Date);
        expect(filters.date_to?.toISOString()).toContain("2026-01-31");
    });

    it("keeps a valid action and user_id", () => {
        const filters = parseAuditLogFilters({
            action: "DELETE",
            user_id: VALID_UUID,
        });

        expect(filters.action).toBe("DELETE");
        expect(filters.user_id).toBe(VALID_UUID);
    });

    it("rejects an unknown action", () => {
        expect(() => parseAuditLogFilters({ action: "TRUNCATE" })).toThrow();
    });

    it("rejects a malformed user_id", () => {
        expect(() => parseAuditLogFilters({ user_id: "not-a-uuid" })).toThrow();
    });

    it("rejects a non-numeric page", () => {
        expect(() => parseAuditLogFilters({ page: "abc" })).toThrow();
    });

    it("rejects a limit above the maximum", () => {
        expect(() => parseAuditLogFilters({ limit: "500" })).toThrow();
    });

    it("rejects a search term longer than 100 characters", () => {
        expect(() =>
            parseAuditLogFilters({ search: "x".repeat(101) })
        ).toThrow();
    });
});

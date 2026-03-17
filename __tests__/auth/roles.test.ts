import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before imports that use them
// ---------------------------------------------------------------------------

// Mock "server-only" so it doesn't throw in a test environment
vi.mock("server-only", () => ({}));

// Mock next/navigation — redirect throws by convention
const mockRedirect = vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
    redirect: (url: string) => mockRedirect(url),
}));

// Mock Supabase client — getClaims is the function under control
const mockGetClaims = vi.fn();
vi.mock("@/supabase/server", () => ({
    createClient: vi.fn().mockResolvedValue({
        auth: { getClaims: () => mockGetClaims() },
    }),
}));

// ---------------------------------------------------------------------------
// Import modules under test AFTER mocks are in place
// ---------------------------------------------------------------------------
import {
    getCurrentUserRole,
    requireMinRole,
    requireBackofficeAccess,
    requireAdminOnly,
    requireBackofficePageAccess,
    requireAdminPageAccess,
} from "@/lib/auth/roles";

// ---------------------------------------------------------------------------
// Helpers — build a fake getClaims() response
// ---------------------------------------------------------------------------
function claimsWithAppRole(role: string) {
    return {
        data: {
            claims: {
                app_metadata: { role },
                user_metadata: {},
            },
        },
        error: null,
    };
}

function claimsWithUserMetaOnly(role: string) {
    return {
        data: {
            claims: {
                app_metadata: {},
                user_metadata: { role },
            },
        },
        error: null,
    };
}

function claimsEmpty() {
    return {
        data: {
            claims: {
                app_metadata: {},
                user_metadata: {},
            },
        },
        error: null,
    };
}

function claimsError() {
    return {
        data: null,
        error: new Error("network failure"),
    };
}

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// 2.4 — getCurrentUserRole()
// ---------------------------------------------------------------------------
describe("getCurrentUserRole", () => {
    it("ROLE-UNIT-025 — rôle depuis app_metadata editor", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        const role = await getCurrentUserRole();
        expect(role).toBe("editor");
    });

    it("ROLE-UNIT-026 — rôle depuis app_metadata admin", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("admin"));
        const role = await getCurrentUserRole();
        expect(role).toBe("admin");
    });

    it("ROLE-UNIT-027 — fallback user_metadata", async () => {
        mockGetClaims.mockResolvedValue(claimsWithUserMetaOnly("editor"));
        const role = await getCurrentUserRole();
        expect(role).toBe("editor");
    });

    it("ROLE-UNIT-028 — aucun rôle défini → user", async () => {
        mockGetClaims.mockResolvedValue(claimsEmpty());
        const role = await getCurrentUserRole();
        expect(role).toBe("user");
    });

    it("ROLE-UNIT-029 — erreur getClaims → user sans crash", async () => {
        mockGetClaims.mockRejectedValue(new Error("network failure"));
        const role = await getCurrentUserRole();
        expect(role).toBe("user");
    });
});

// ---------------------------------------------------------------------------
// 2.5 — requireMinRole()
// ---------------------------------------------------------------------------
describe("requireMinRole", () => {
    it("ROLE-UNIT-030 — admin passe admin", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("admin"));
        await expect(requireMinRole("admin")).resolves.toBeUndefined();
    });

    it("ROLE-UNIT-031 — editor passe editor", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        await expect(requireMinRole("editor")).resolves.toBeUndefined();
    });

    it("ROLE-UNIT-032 — editor échoue admin", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        await expect(requireMinRole("admin")).rejects.toThrow("Unauthorized");
    });

    it("ROLE-UNIT-033 — user échoue editor", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("user"));
        await expect(requireMinRole("editor")).rejects.toThrow("Unauthorized");
    });
});

// ---------------------------------------------------------------------------
// 2.6 — requireBackofficeAccess() & requireAdminOnly()
// ---------------------------------------------------------------------------
describe("requireBackofficeAccess", () => {
    it("ROLE-UNIT-034 — editor a accès backoffice", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        await expect(requireBackofficeAccess()).resolves.toBeUndefined();
    });

    it("ROLE-UNIT-035 — user n'a pas accès backoffice", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("user"));
        await expect(requireBackofficeAccess()).rejects.toThrow("Unauthorized");
    });
});

describe("requireAdminOnly", () => {
    it("ROLE-UNIT-036 — admin a accès admin-only", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("admin"));
        await expect(requireAdminOnly()).resolves.toBeUndefined();
    });

    it("ROLE-UNIT-037 — editor n'a pas accès admin-only", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        await expect(requireAdminOnly()).rejects.toThrow("Unauthorized");
    });
});

// ---------------------------------------------------------------------------
// 2.7 — requireBackofficePageAccess() & requireAdminPageAccess()
// ---------------------------------------------------------------------------
describe("requireBackofficePageAccess", () => {
    it("ROLE-UNIT-038 — editor passe page backoffice", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        await expect(
            requireBackofficePageAccess(),
        ).resolves.toBeUndefined();
    });

    it("ROLE-UNIT-039 — user redirect page backoffice", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("user"));
        await expect(requireBackofficePageAccess()).rejects.toThrow(
            "NEXT_REDIRECT:/auth/login",
        );
        expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
    });

    it("ROLE-UNIT-040 — pas de session → redirect login", async () => {
        mockGetClaims.mockResolvedValue(claimsError());
        await expect(requireBackofficePageAccess()).rejects.toThrow(
            "NEXT_REDIRECT:/auth/login",
        );
        expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
    });
});

describe("requireAdminPageAccess", () => {
    it("ROLE-UNIT-041 — admin passe page admin", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("admin"));
        await expect(requireAdminPageAccess()).resolves.toBeUndefined();
    });

    it("ROLE-UNIT-042 — editor redirect page admin", async () => {
        mockGetClaims.mockResolvedValue(claimsWithAppRole("editor"));
        await expect(requireAdminPageAccess()).rejects.toThrow(
            "NEXT_REDIRECT:/auth/login",
        );
        expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
    });
});

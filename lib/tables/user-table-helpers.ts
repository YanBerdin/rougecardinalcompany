import type { UserWithProfile } from "@/lib/dal/admin-users";
import type { SortState } from "@/components/ui/sortable-header";

// ========================================================================
// User Sorting Types
// ========================================================================

export type UserSortField =
    | "email"
    | "name"
    | "role"
    | "status"
    | "created_at"
    | "last_sign_in_at";

export type UserSortState = SortState<UserSortField>;

// ========================================================================
// User Sorting Functions
// ========================================================================

function getUserStatus(user: UserWithProfile): number {
    if (user.email_confirmed_at) return 2; // Vérifié
    if (user.invited_at) return 1; // Invité
    return 0; // Non vérifié
}

function getRoleWeight(role: string | undefined): number {
    switch (role) {
        case "admin":
            return 3;
        case "editor":
            return 2;
        case "user":
        default:
            return 1;
    }
}

export function sortUsers(
    users: UserWithProfile[],
    sortState: UserSortState
): UserWithProfile[] {
    return [...users].sort((a, b) => {
        const { field, direction } = sortState;
        const multiplier = direction === "asc" ? 1 : -1;

        let aValue: string | number | null;
        let bValue: string | number | null;

        switch (field) {
            case "email":
                aValue = a.email?.toLowerCase() || "";
                bValue = b.email?.toLowerCase() || "";
                break;

            case "name":
                aValue = a.profile?.display_name?.toLowerCase() || "";
                bValue = b.profile?.display_name?.toLowerCase() || "";
                break;

            case "role":
                aValue = getRoleWeight(a.profile?.role);
                bValue = getRoleWeight(b.profile?.role);
                break;

            case "status":
                aValue = getUserStatus(a);
                bValue = getUserStatus(b);
                break;

            case "created_at":
                aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
                bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
                break;

            case "last_sign_in_at":
                aValue = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
                bValue = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
                break;

            default:
                return 0;
        }

        // Handle null/empty values - put them at the end
        if (!aValue && bValue) return 1 * multiplier;
        if (aValue && !bValue) return -1 * multiplier;
        if (!aValue && !bValue) return 0;

        // String comparison with French locale
        if (typeof aValue === "string" && typeof bValue === "string") {
            return (
                aValue.localeCompare(bValue, "fr", { sensitivity: "base" }) * multiplier
            );
        }

        // Numeric comparison
        if (typeof aValue === "number" && typeof bValue === "number") {
            return (aValue - bValue) * multiplier;
        }

        return 0;
    });
}

// ========================================================================
// Toggle Sort Helper
// ========================================================================

export function toggleUserSort(
    currentSort: UserSortState | null,
    field: UserSortField
): UserSortState {
    if (currentSort?.field === field) {
        return {
            field,
            direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
    }
    return { field, direction: "asc" };
}

import type { UserWithProfile } from "@/lib/dal/admin-users";

// ============================================================================
// Shared Constants
// ============================================================================

export const ROLE_LABELS = {
    user: "Utilisateur",
    editor: "Éditeur",
    admin: "Administrateur",
} as const;

// ============================================================================
// Shared Types
// ============================================================================

export type UserRole = "user" | "editor" | "admin";

export interface UsersManagementViewProps {
    users: UserWithProfile[];
}

export interface RoleChangeData {
    userId: string;
    email: string;
    currentRole: string;
    newRole: UserRole;
}

export interface UserToDelete {
    id: string;
    email: string;
}

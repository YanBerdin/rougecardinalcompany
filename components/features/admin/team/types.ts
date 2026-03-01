/**
 * Prop types for Admin Team feature components
 * @module components/features/admin/team/types
 */
import type { TeamMemberDb, TeamMemberFormValues } from "@/lib/schemas/team";

/** Default avatar when no photo is set */
export const DEFAULT_TEAM_MEMBER_AVATAR = "/logo-florian.png";

export interface TeamManagementContainerProps {
    initialMembers: TeamMemberDb[];
}

export interface TeamMemberListProps {
    members: TeamMemberDb[];
    onEditMember?: (id: number) => void;
    onDeactivateMember?: (id: number) => void;
    onReactivateMember?: (id: number) => void;
    onHardDeleteMember?: (id: number) => void;
}

export interface TeamMemberCardProps {
    member: TeamMemberDb;
    onEdit?: () => void;
    /** Renamed from onDesactivate — triggers deactivation dialog */
    onDeactivate?: () => void;
    onRequestReactivate?: () => void;
    onHardDelete?: () => void;
}

export interface TeamMemberFormProps {
    member?: TeamMemberDb | null;
    onSubmit: (data: TeamMemberFormValues) => Promise<void>;
    onCancel?: () => void;
}

export interface TeamMemberFormProps {
    member?: TeamMemberDb | null;
    onSubmit: (data: import("@/lib/schemas/team").TeamMemberFormValues) => Promise<void>;
    onCancel?: () => void;
}

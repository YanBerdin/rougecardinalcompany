"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { HttpStatus } from "@/lib/api/helpers";
import { type DALResult, dalSuccess, dalError } from "@/lib/dal/helpers";
import { fetchTeamMemberById } from "@/lib/dal/team";

/**
 * Permanently deletes a team member (RGPD compliance).
 *
 * CRITICAL: Irreversible. Member must be inactive before deletion.
 *
 * @param id - Team member ID to delete
 */
export async function hardDeleteTeamMember(
    id: number
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const validation = await validateTeamMemberForDeletion(id);
        if (!validation.success) return validation;

        return await performTeamMemberDeletion(id);
    } catch (error: unknown) {
        return handleHardDeleteError(error);
    }
}

// ============================================================================
// Private helpers
// ============================================================================

async function validateTeamMemberForDeletion(id: number): Promise<DALResult<null>> {
    const result = await fetchTeamMemberById(id);

    if (!result.success || !result.data) {
        return dalError("[ERR_TEAM_050] Team member not found", HttpStatus.NOT_FOUND);
    }

    if (result.data.active) {
        return dalError(
            "[ERR_TEAM_051] Cannot delete active team member. Deactivate first.",
            HttpStatus.BAD_REQUEST
        );
    }

    return dalSuccess(null);
}

async function performTeamMemberDeletion(id: number): Promise<DALResult<null>> {
    const supabase = await createClient();
    const { error: deleteError } = await supabase
        .from("membres_equipe")
        .delete()
        .eq("id", id);

    if (deleteError) {
        console.error("[ERR_TEAM_052] Error deleting team member:", deleteError);
        return dalError("[ERR_TEAM_052] Failed to delete team member", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return dalSuccess(null);
}

function handleHardDeleteError(error: unknown): DALResult<null> {
    console.error("[DAL] hardDeleteTeamMember error:", error);

    if (error instanceof Error && error.message.includes("Forbidden")) {
        return dalError("Insufficient permissions", HttpStatus.FORBIDDEN);
    }

    return dalError("Internal error during deletion", HttpStatus.INTERNAL_SERVER_ERROR);
}

"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CreateTeamMemberInputSchema,
  UpdateTeamMemberInputSchema,
  ReorderTeamMembersInputSchema,
  type TeamMemberDb,
  type CreateTeamMemberInput,
  type UpdateTeamMemberInput,
} from "@/lib/schemas/team";
import {
  upsertTeamMember,
  reorderTeamMembers,
  fetchTeamMemberById,
  setTeamMemberActive,
  hardDeleteTeamMember,
} from "@/lib/dal/team";
import { requireAdmin } from "@/lib/auth/is-admin";

// Use centralized ActionResult<T> from @/lib/actions/types
import type { ActionResult } from "@/lib/actions/types";

// Extended type for team actions that need HTTP status codes
type ActionResponse<T> = ActionResult<T> & { status?: number; details?: unknown };

export async function createTeamMember(
  input: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    const validated: CreateTeamMemberInput =
      CreateTeamMemberInputSchema.parse(input);
    const result = await upsertTeamMember(validated);

    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to create team member",
        status: 500,
      };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return handleActionError(error, "createTeamMember");
  }
}

export async function updateTeamMember(
  teamMemberId: number,
  updateInput: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    if (!isValidTeamMemberId(teamMemberId)) {
      return { success: false, error: "Invalid id", status: 400 };
    }

    const validated: UpdateTeamMemberInput =
      UpdateTeamMemberInputSchema.parse(updateInput);
    const existing = await fetchTeamMemberById(teamMemberId);

    if (!existing) {
      return { success: false, error: "Team member not found", status: 404 };
    }

    const result = await upsertTeamMember({
      ...validated,
      id: teamMemberId,
    });

    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to update team member",
        status: 500,
      };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return handleActionError(error, "updateTeamMember");
  }
}

export async function reorderTeamMembersAction(
  reorderInput: unknown
): Promise<ActionResponse<null>> {
  try {
    const validated = ReorderTeamMembersInputSchema.parse(reorderInput);
    const result = await reorderTeamMembers(validated);

    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to reorder team members",
        status: 500,
      };
    }

    return { success: true, data: null };
  } catch (error: unknown) {
    return handleActionError(error, "reorderTeamMembersAction");
  }
}

export async function setTeamMemberActiveAction(
  teamMemberId: number,
  isActiveStatus: boolean
): Promise<ActionResponse<null>> {
  try {
    if (!isValidTeamMemberId(teamMemberId)) {
      return { success: false, error: "Invalid team member id", status: 400 };
    }

    const result = await setTeamMemberActive(teamMemberId, isActiveStatus);
    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to set team member active flag",
        status: 500,
      };
    }

    return { success: true, data: null };
  } catch (error: unknown) {
    return handleActionError(error, "setTeamMemberActiveAction");
  }
}

/**
 * 
 * CRITICAL: Permanently deletes a team member (RGPD compliance).
 * The member must be deactivated before deletion.
 */
export async function hardDeleteTeamMemberAction(
  teamMemberId: number
): Promise<ActionResponse<null>> {
  try {
    if (!isValidTeamMemberId(teamMemberId)) {
      return { success: false, error: "Invalid team member id", status: 400 };
    }

    const result = await hardDeleteTeamMember(teamMemberId);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to delete team member",
        status: result?.status ?? 500,
      };
    }

    revalidatePath("/admin/team");
    return { success: true, data: null };
  } catch (error: unknown) {
    return handleActionError(error, "hardDeleteTeamMemberAction");
  }
}

/**
 * @deprecated Use `uploadMediaImage(formData, folder)` from `@/lib/actions` instead.
 * This wrapper keeps the old API for backwards compatibility while ensuring
 * the exported symbol is an async Server Action (required by Next.js).
 */
export async function uploadTeamMemberPhoto(
  photoFormData: FormData
): Promise<ActionResponse<{ mediaId: number; publicUrl: string }>> {
  try {
    const actions = await import("@/lib/actions");
    const result = await actions.uploadMediaImage(photoFormData, "team");

    if (!result.success) {
      return { success: false, error: result.error ?? "Upload failed" };
    }

    return {
      success: true,
      data: {
        mediaId: result.data.mediaId,
        publicUrl: result.data.publicUrl,
      },
    };
  } catch (error: unknown) {
    return handleActionError(error, "uploadTeamMemberPhoto");
  }
}

function isValidTeamMemberId(teamMemberId: number): boolean {
  return Number.isFinite(teamMemberId) && teamMemberId > 0;
}

// Helper functions removed - now using centralized lib/actions/media-actions

function handleActionError(
  error: unknown,
  functionName: string
): ActionResponse<never> {
  console.error(`${functionName} error:`, error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: "Validation failed",
      status: 422,
      details: error.issues,
    };
  }

  return {
    success: false,
    error:
      error instanceof Error ? error.message : String(error ?? "Unknown error"),
    status: 500,
  };
}

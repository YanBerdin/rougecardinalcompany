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
  fetchTeamMemberById,
  setTeamMemberActive,
} from "@/lib/dal/team";
import { hardDeleteTeamMember } from "@/lib/dal/team-hard-delete";
import { reorderTeamMembers } from "@/lib/dal/team-reorder";

// Use centralized ActionResult<T> from @/lib/actions/types
import type { ActionResult } from "@/lib/actions/types";

// Extended type for team actions that need HTTP status codes
type ActionResponse<T> = ActionResult<T> & { status?: number; details?: unknown };

/** Zod schema replacing the isValidTeamMemberId helper — accepts unknown input */
const TeamMemberIdSchema = z.coerce.number().int().positive();

export async function createTeamMember(
  input: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    const validated: CreateTeamMemberInput =
      await CreateTeamMemberInputSchema.parseAsync(input);

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
  teamMemberId: unknown,
  updateInput: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    const idParsed = TeamMemberIdSchema.safeParse(teamMemberId);
    if (!idParsed.success) {
      return { success: false, error: "Invalid id", status: 400 };
    }

    const validated: UpdateTeamMemberInput =
      await UpdateTeamMemberInputSchema.parseAsync(updateInput);

    const existingResult = await fetchTeamMemberById(idParsed.data);
    if (!existingResult.success || existingResult.data === null) {
      return { success: false, error: "Team member not found", status: 404 };
    }

    const result = await upsertTeamMember({
      ...validated,
      id: idParsed.data,
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
  teamMemberId: unknown,
  isActiveStatus: unknown
): Promise<ActionResponse<null>> {
  try {
    const idParsed = TeamMemberIdSchema.safeParse(teamMemberId);
    if (!idParsed.success) {
      return { success: false, error: "Invalid team member id", status: 400 };
    }

    const activeParsed = z.boolean().safeParse(isActiveStatus);
    if (!activeParsed.success) {
      return { success: false, error: "Invalid active status", status: 400 };
    }

    const result = await setTeamMemberActive(idParsed.data, activeParsed.data);
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
  teamMemberId: unknown
): Promise<ActionResponse<null>> {
  try {
    const idParsed = TeamMemberIdSchema.safeParse(teamMemberId);
    if (!idParsed.success) {
      return { success: false, error: "Invalid team member id", status: 400 };
    }

    const result = await hardDeleteTeamMember(idParsed.data);

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

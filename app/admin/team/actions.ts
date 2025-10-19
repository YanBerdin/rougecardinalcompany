"use server";
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
} from "@/lib/dal/team";
import { requireAdmin } from "@/lib/auth/is-admin";

type ActionResponse<T> = {
  success: boolean;
  data?: T | null;
  error?: string;
  status?: number; // HTTP-like status for callers
  details?: unknown; // optional extra details (e.g. Zod issues)
};

export async function createTeamMember(
  input: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    await requireAdmin();
    const parsed = CreateTeamMemberInputSchema.parse(input);
    const created = await upsertTeamMember(parsed as CreateTeamMemberInput);

    revalidatePath("/admin/team");

    if (!created)
      return {
        success: false,
        error: "Failed to create team member",
        status: 500,
      };
    return { success: true, data: created };
  } catch (err: unknown) {
    console.error("createTeamMember error:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        status: 422,
        details: err.issues,
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err ?? "Unknown error"),
      status: 500,
    };
  }
}

export async function updateTeamMember(
  id: number,
  input: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    await requireAdmin();
    if (!Number.isFinite(id) || id <= 0) {
      return { success: false, error: "Invalid id", status: 400 };
    }
    const parsed = UpdateTeamMemberInputSchema.parse(input);
    // ensure the record exists
    const existing = await fetchTeamMemberById(id);
    if (!existing) return { success: false, error: "Not found" };

  const updated = await upsertTeamMember({ ...(parsed as UpdateTeamMemberInput), id });

    revalidatePath("/admin/team");

    if (!updated) return { success: false, error: "Failed to update" };
    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("updateTeamMember error:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        status: 422,
        details: err.issues,
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err ?? "Unknown error"),
      status: 500,
    };
  }
}

export async function reorderTeamMembersAction(
  input: unknown
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin();
    const parsed = ReorderTeamMembersInputSchema.parse(input);
    const ok = await reorderTeamMembers(parsed);
    revalidatePath("/admin/team");
    if (!ok) return { success: false, error: "Failed to reorder" };
    return { success: true, data: null };
  } catch (err: unknown) {
    console.error("reorderTeamMembersAction error:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        status: 422,
        details: err.issues,
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err ?? "Unknown error"),
      status: 500,
    };
  }
}

export async function setTeamMemberActiveAction(
  id: number,
  active: boolean
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin();
    if (!Number.isFinite(id) || id <= 0) {
      return { success: false, error: "Invalid id", status: 400 };
    }
    if (typeof active !== "boolean") {
      return { success: false, error: "Invalid active value", status: 400 };
    }
    const ok = await setTeamMemberActive(id, active);
    revalidatePath("/admin/team");
    if (!ok) return { success: false, error: "Failed to set active flag" };
    return { success: true, data: null };
  } catch (err: unknown) {
    console.error("setTeamMemberActiveAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err ?? "Unknown error"),
      status: 500,
    };
  }
}

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
      error:
        err instanceof Error ? err.message : String(err ?? "Unknown error"),
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

    const updated = await upsertTeamMember({
      ...(parsed as UpdateTeamMemberInput),
      id,
    });

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
      error:
        err instanceof Error ? err.message : String(err ?? "Unknown error"),
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
      error:
        err instanceof Error ? err.message : String(err ?? "Unknown error"),
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
      error:
        err instanceof Error ? err.message : String(err ?? "Unknown error"),
      status: 500,
    };
  }
}

/*
export async function hardDeleteTeamMemberAction(
  id: number
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin();
    if (!Number.isFinite(id) || id <= 0) {
      return { success: false, error: "Invalid id", status: 400 };
    }

    // Permanent deletion (RGPD): deletes the row from the database.
    // This is a critical operation that requires explicit admin verification.
    const { createClient } = await import("@/supabase/server");
    const supabase = await createClient();

    const { error } = await supabase
      .from("membres_equipe")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("hardDeleteTeamMemberAction database error:", error);
      return {
        success: false,
        error: "Failed to permanently delete team member",
        status: 500,
      };
    }

    revalidatePath("/admin/team");

    return { success: true, data: null };
  } catch (err: unknown) {
    console.error("hardDeleteTeamMemberAction error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : String(err ?? "Unknown error"),
      status: 500,
    };
  }
}
*/

export async function uploadTeamMemberPhoto(
  formData: FormData
): Promise<ActionResponse<{ mediaId: number; publicUrl: string }>> {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file provided", status: 400 };
    }

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large (max 5MB)",
        status: 400,
      };
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Allowed: JPEG, PNG, WebP, AVIF",
        status: 400,
      };
    }

    // Générer nom de fichier unique
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `team-${timestamp}-${randomStr}.${ext}`;
    const storagePath = `team-photos/${filename}`;

    // Upload vers Supabase Storage
    const { createClient } = await import("@/supabase/server");
    const supabase = await createClient();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("medias")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
        status: 500,
      };
    }

    // Obtenir URL publique
    const { data: urlData } = supabase.storage
      .from("medias")
      .getPublicUrl(storagePath);

    // Créer enregistrement dans table medias
    const { data: mediaRecord, error: insertError } = await supabase
      .from("medias")
      .insert({
        storage_path: storagePath,
        filename: file.name,
        mime: file.type,
        size_bytes: file.size,
        metadata: { bucket: "medias", type: "team_photo" },
      })
      .select()
      .single();

    if (insertError || !mediaRecord) {
      console.error("Media record insertion error:", insertError);
      // Tenter de nettoyer le fichier uploadé
      await supabase.storage.from("medias").remove([storagePath]);
      return {
        success: false,
        error: "Failed to create media record",
        status: 500,
      };
    }

    return {
      success: true,
      data: {
        mediaId: mediaRecord.id,
        publicUrl: urlData.publicUrl,
      },
    };
  } catch (err: unknown) {
    console.error("uploadTeamMemberPhoto error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Upload failed",
      status: 500,
    };
  }
}

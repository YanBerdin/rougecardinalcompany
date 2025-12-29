"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { BulkDeleteSchema, BulkMoveSchema, BulkTagSchema } from "@/lib/schemas/media";

/**
 * @file Bulk Media Operations Server Actions
 * @description Server Actions for bulk operations with Zod validation (max 50 items)
 * @module lib/actions/media-bulk-actions
 * 
 * SECURITY:
 * - requireAdmin() check on all operations
 * - Zod validation with max 50 items limit
 * - revalidatePath() after success
 */

export type BulkActionResult =
    | { success: true; count: number }
    | { success: false; error: string };

// =============================================================================
// BULK DELETE
// =============================================================================

/**
 * Delete multiple media items
 * Max 50 items per request (validated by Zod)
 */
export async function bulkDeleteMediaAction(
    mediaIds: number[]
): Promise<BulkActionResult> {
    try {
        await requireAdmin();

        // Validation with max limit
        const validated = BulkDeleteSchema.parse({ media_ids: mediaIds });

        const supabase = await createClient();

        // Get storage paths before deletion
        const { data: mediaItems, error: fetchError } = await supabase
            .from("medias")
            .select("storage_path")
            .in("id", validated.media_ids);

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        // Delete from database (cascade will handle media_item_tags)
        const { error: deleteError } = await supabase
            .from("medias")
            .delete()
            .in("id", validated.media_ids);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        // Delete from storage (non-blocking, best effort)
        if (mediaItems && mediaItems.length > 0) {
            const storagePaths = mediaItems.map((item) => item.storage_path);
            await supabase.storage.from("medias").remove(storagePaths);
        }

        revalidatePath("/admin/media");
        revalidatePath("/admin/media/library");

        return { success: true, count: validated.media_ids.length };
    } catch (error) {
        console.error("[bulkDeleteMediaAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur suppression bulk",
        };
    }
}

// =============================================================================
// BULK MOVE TO FOLDER
// =============================================================================

/**
 * Move multiple media items to a folder
 * Max 50 items per request
 */
export async function bulkMoveMediaAction(
    mediaIds: number[],
    folderId: number | null
): Promise<BulkActionResult> {
    try {
        await requireAdmin();

        // Validation
        const validated = BulkMoveSchema.parse({
            media_ids: mediaIds,
            folder_id: folderId,
        });

        const supabase = await createClient();

        // Update folder_id for all selected media
        // Note: Supabase client handles number → bigint conversion automatically
        const { error: updateError } = await supabase
            .from("medias")
            .update({
                folder_id: validated.folder_id,
                updated_at: new Date().toISOString(),
            })
            .in("id", validated.media_ids);

        if (updateError) {
            throw new Error(updateError.message);
        }

        revalidatePath("/admin/media");
        revalidatePath("/admin/media/library");

        return { success: true, count: validated.media_ids.length };
    } catch (error) {
        console.error("[bulkMoveMediaAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur déplacement bulk",
        };
    }
}

// =============================================================================
// BULK TAG ASSIGNMENT
// =============================================================================

/**
 * Add tags to multiple media items
 * Max 50 items per request
 */
export async function bulkTagMediaAction(
    mediaIds: number[],
    tagIds: number[]
): Promise<BulkActionResult> {
    try {
        await requireAdmin();

        // Validation
        const validated = BulkTagSchema.parse({
            media_ids: mediaIds,
            tag_ids: tagIds,
        });

        const supabase = await createClient();

        // Create all combinations of media_id x tag_id
        // Note: Supabase client handles number → bigint conversion automatically
        const insertData = validated.media_ids.flatMap((mediaId) =>
            validated.tag_ids.map((tagId) => ({
                media_id: mediaId,
                tag_id: tagId,
            }))
        );

        // Insert (ignore duplicates via ON CONFLICT)
        const { error: insertError } = await supabase
            .from("media_item_tags")
            .upsert(insertData, { onConflict: "media_id,tag_id" });

        if (insertError) {
            throw new Error(insertError.message);
        }

        revalidatePath("/admin/media");
        revalidatePath("/admin/media/library");

        return { success: true, count: validated.media_ids.length };
    } catch (error) {
        console.error("[bulkTagMediaAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur tag bulk",
        };
    }
}

// =============================================================================
// BULK TAG REMOVAL
// =============================================================================

/**
 * Remove tags from multiple media items
 * Max 50 items per request
 */
export async function bulkUntagMediaAction(
    mediaIds: number[],
    tagIds: number[]
): Promise<BulkActionResult> {
    try {
        await requireAdmin();

        // Validation (reuse BulkTagSchema)
        const validated = BulkTagSchema.parse({
            media_ids: mediaIds,
            tag_ids: tagIds,
        });

        const supabase = await createClient();

        // Delete all matching media_id x tag_id combinations
        const { error: deleteError } = await supabase
            .from("media_item_tags")
            .delete()
            .in("media_id", validated.media_ids)
            .in("tag_id", validated.tag_ids);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        revalidatePath("/admin/media");
        revalidatePath("/admin/media/library");

        return { success: true, count: validated.media_ids.length };
    } catch (error) {
        console.error("[bulkUntagMediaAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur retrait tags bulk",
        };
    }
}

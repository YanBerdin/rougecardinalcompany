/**
 * @file Media Tags Server Actions
 * @description Server Actions for managing media tags (CRUD operations)
 */
"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/dal/helpers";
import {
    listMediaTags,
    getMediaTagById,
    createMediaTag,
    updateMediaTag,
    deleteMediaTag,
} from "@/lib/dal/media";
import { toMediaTagDTO } from "@/lib/dal/helpers/serialize";
import {
    MediaTagInputSchema,
    type MediaTagInput,
    type MediaTagDTO,
} from "@/lib/schemas/media";

export type MediaTagActionResult =
    | { success: true; data: MediaTagDTO }
    | { success: false; error: string };

export type MediaTagsListResult =
    | { success: true; data: MediaTagDTO[] }
    | { success: false; error: string };

/**
 * List all media tags (with DTO conversion)
 */
export async function listMediaTagsAction(): Promise<MediaTagsListResult> {
    try {
        const result = await listMediaTags();

        if (!result.success) {
            return { success: false, error: result.error };
        }

        const dtos = result.data.map(toMediaTagDTO);
        return { success: true, data: dtos };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get media tag by ID (with DTO conversion)
 */
export async function getMediaTagByIdAction(
    id: number
): Promise<MediaTagActionResult> {
    try {
        const result = await getMediaTagById(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error };
        }

        if (!result.data) {
            return { success: false, error: "Tag not found" };
        }

        const dto = toMediaTagDTO(result.data);
        return { success: true, data: dto };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Create media tag
 */
export async function createMediaTagAction(
    input: unknown
): Promise<MediaTagActionResult> {
    try {
        // Validation with Zod
        const validated: MediaTagInput = MediaTagInputSchema.parse(input);

        // Generate slug from name
        const slug = await generateSlug(validated.name);

        // Create tag via DAL
        const result = await createMediaTag({
            name: validated.name,
            slug: slug,
            description: validated.description ?? null,
            color: validated.color ?? null,
        });

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Revalidate admin media pages
        revalidatePath("/admin/media");

        const dto = toMediaTagDTO(result.data);
        return { success: true, data: dto };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Validation failed",
        };
    }
}

/**
 * Update media tag
 */
export async function updateMediaTagAction(
    id: number,
    input: unknown
): Promise<MediaTagActionResult> {
    try {
        // Validation with Zod (partial)
        const validated = MediaTagInputSchema.partial().parse(input);

        // Update tag via DAL
        const result = await updateMediaTag(BigInt(id), {
            name: validated.name,
            description: validated.description ?? null,
            color: validated.color ?? null,
        });

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Revalidate admin media pages
        revalidatePath("/admin/media");

        const dto = toMediaTagDTO(result.data);
        return { success: true, data: dto };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Update failed",
        };
    }
}

/**
 * Delete media tag
 */
export async function deleteMediaTagAction(
    id: number
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const result = await deleteMediaTag(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Revalidate admin media pages
        revalidatePath("/admin/media");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Delete failed",
        };
    }
}

/**
 * Delete media tag with redirect
 */
export async function deleteMediaTagWithRedirectAction(
    id: number
): Promise<void> {
    const result = await deleteMediaTagAction(id);

    if (!result.success) {
        throw new Error(result.error);
    }

    redirect("/admin/media/tags");
}

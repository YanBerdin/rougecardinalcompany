/**
 * @file Media Folders Server Actions
 * @description Server Actions for managing media folders (CRUD operations)
 */
"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/dal/helpers";
import {
    listMediaFolders,
    getMediaFolderById,
    createMediaFolder,
    updateMediaFolder,
    deleteMediaFolder,
} from "@/lib/dal/media";
import { toMediaFolderDTO } from "@/lib/dal/helpers/serialize";
import {
    MediaFolderInputSchema,
    type MediaFolderInput,
    type MediaFolderDTO,
} from "@/lib/schemas/media";

export type MediaFolderActionResult =
    | { success: true; data: MediaFolderDTO }
    | { success: false; error: string };

export type MediaFoldersListResult =
    | { success: true; data: MediaFolderDTO[] }
    | { success: false; error: string };

/**
 * List all media folders (with DTO conversion)
 */
export async function listMediaFoldersAction(): Promise<MediaFoldersListResult> {
    try {
        const result = await listMediaFolders();

        if (!result.success) {
            return { success: false, error: result.error };
        }

        const dtos = result.data.map(toMediaFolderDTO);
        return { success: true, data: dtos };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get media folder by ID (with DTO conversion)
 */
export async function getMediaFolderByIdAction(
    id: number
): Promise<MediaFolderActionResult> {
    try {
        const result = await getMediaFolderById(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error };
        }

        if (!result.data) {
            return { success: false, error: "Folder not found" };
        }

        const dto = toMediaFolderDTO(result.data);
        return { success: true, data: dto };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Create media folder
 */
export async function createMediaFolderAction(
    input: unknown
): Promise<MediaFolderActionResult> {
    try {
        // Validation with Zod
        const validated: MediaFolderInput = MediaFolderInputSchema.parse(input);

        // Use provided slug or generate from name
        const slug = validated.slug || await generateSlug(validated.name);

        // Create folder via DAL
        const result = await createMediaFolder({
            name: validated.name,
            slug: slug,
            description: validated.description ?? null,
            parent_id: validated.parent_id ? BigInt(validated.parent_id) : null,
        });

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Revalidate admin media pages
        revalidatePath("/admin/media");

        const dto = toMediaFolderDTO(result.data);
        return { success: true, data: dto };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Validation failed",
        };
    }
}

/**
 * Update media folder
 */
export async function updateMediaFolderAction(
    id: number,
    input: unknown
): Promise<MediaFolderActionResult> {
    try {
        // Validation with Zod (partial)
        const validated = MediaFolderInputSchema.partial().parse(input);

        // Update folder via DAL (include slug if provided)
        const result = await updateMediaFolder(BigInt(id), {
            name: validated.name,
            slug: validated.slug,
            description: validated.description ?? null,
            parent_id: validated.parent_id ? BigInt(validated.parent_id) : null,
        });

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Revalidate admin media pages
        revalidatePath("/admin/media");

        const dto = toMediaFolderDTO(result.data);
        return { success: true, data: dto };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Update failed",
        };
    }
}

/**
 * Delete media folder
 */
export async function deleteMediaFolderAction(
    id: number
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const result = await deleteMediaFolder(BigInt(id));

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
 * Delete media folder with redirect
 */
export async function deleteMediaFolderWithRedirectAction(
    id: number
): Promise<void> {
    const result = await deleteMediaFolderAction(id);

    if (!result.success) {
        throw new Error(result.error);
    }

    redirect("/admin/media/folders");
}

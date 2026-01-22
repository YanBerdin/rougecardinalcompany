/**
 * Utilities for Press Release and Article forms
 * - Clean form data (convert number → bigint for Server Actions)
 * - Success messages
 */

import type { PressReleaseFormValues } from "@/lib/schemas/press-release";
import type { ArticleFormValues } from "@/lib/schemas/press-article";

/**
 * Clean Press Release form data for Server Action submission
 * Converts number fields to bigint for database operations
 */
export function cleanPressReleaseFormData(
    data: PressReleaseFormValues
): Omit<PressReleaseFormValues, "image_media_id" | "spectacle_id" | "evenement_id"> & {
    image_media_id?: bigint;
    spectacle_id?: bigint;
    evenement_id?: bigint;
} {
    return {
        ...data,
        image_media_id: data.image_media_id ? BigInt(data.image_media_id) : undefined,
        spectacle_id: data.spectacle_id ? BigInt(data.spectacle_id) : undefined,
        evenement_id: data.evenement_id ? BigInt(data.evenement_id) : undefined,
    };
}

/**
 * Clean Article form data for Server Action submission
 * Converts number fields to bigint for database operations
 */
export function cleanArticleFormData(
    data: ArticleFormValues
): Omit<ArticleFormValues, "og_image_media_id"> & {
    og_image_media_id?: bigint;
} {
    return {
        ...data,
        og_image_media_id: data.og_image_media_id ? BigInt(data.og_image_media_id) : undefined,
    };
}

/**
 * Get success message for Press Release operations
 */
export function getPressReleaseSuccessMessage(
    isEditing: boolean,
    title: string
): { description: string } {
    return {
        description: isEditing
            ? `Les modifications du communiqué "${title}" ont été enregistrées.`
            : `Le communiqué "${title}" a été créé avec succès.`,
    };
}

/**
 * Get success message for Article operations
 */
export function getArticleSuccessMessage(
    isEditing: boolean,
    title: string
): { description: string } {
    return {
        description: isEditing
            ? `L'article "${title}" a été mis à jour.`
            : `L'article "${title}" a été créé avec succès.`,
    };
}

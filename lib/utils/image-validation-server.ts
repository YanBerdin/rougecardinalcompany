"use server";

import { validateImageUrl, type ImageValidationResult } from "./validate-image-url";

/**
 * Zod refinement for validating external image URLs server-side.
 * Uses validateImageUrl for SSRF checks + format validation.
 *
 * Only validates if value is provided (non-empty).
 * Returns true if URL is valid, false otherwise.
 */
export async function imageUrlRefinement(
    url: string | undefined | null
): Promise<boolean> {
    if (!url || typeof url !== "string" || url.trim() === "") {
        return true;
    }

    try {
        const result = await validateImageUrl(url);
        return result.valid;
    } catch {
        return false;
    }
}

/**
 * Error message function for imageUrlRefinement.
 * Returns the detailed error message from validateImageUrl.
 */
export async function imageUrlRefinementError(
    url: string | undefined | null
): Promise<{ message: string }> {
    if (!url || typeof url !== "string" || url.trim() === "") {
        return { message: "Invalid image URL" };
    }

    try {
        const result: ImageValidationResult = await validateImageUrl(url);
        if (!result.valid) {
            return {
                message: result.error || "Image validation failed",
            };
        }
        return { message: "Invalid image URL" };
    } catch (error) {
        return {
            message:
                error instanceof Error ? error.message : "Unknown image validation error",
        };
    }
}

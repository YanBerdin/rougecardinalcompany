"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import type { AboutContentInput } from "@/lib/schemas/home-content";
import { AboutContentInputSchema } from "@/lib/schemas/home-content";
import { updateAboutContent } from "@/lib/dal/admin-home-about";
import { validateImageUrl } from "@/lib/utils/validate-image-url";

export type ActionResult<T = unknown> = { success: true; data?: T } | { success: false; error: string };

export async function updateAboutContentAction(
    id: string | number,
    input: unknown
): Promise<ActionResult> {
    try {
        const contentId = typeof id === "string" ? BigInt(id) : BigInt(id);
        const validated = AboutContentInputSchema.parse(input);
        
        // Validate external image URL if provided
        if (validated.image_url) {
            const urlValidation = await validateImageUrl(validated.image_url);
            if (!urlValidation.valid) {
                return {
                    success: false,
                    error: urlValidation.error || "URL d'image invalide ou non autorisée",
                };
            }
        }
        
        const result = await updateAboutContent(contentId, validated as AboutContentInput);

        if (!result.success) {
            return { success: false, error: result.error ?? "update failed" };
        }

        revalidatePath("/admin/home/about");
        revalidatePath("/");

        return { success: true, data: result.data };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
}

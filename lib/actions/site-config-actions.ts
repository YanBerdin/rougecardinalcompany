"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { updateDisplayToggle } from "@/lib/dal/site-config";
import { DisplayToggleFormSchema } from "@/lib/schemas/site-config";
import type { ActionResult } from "./types";

/**
 * Update display toggle action
 * Revalidates affected paths automatically
 */
export async function updateDisplayToggleAction(
    input: unknown
): Promise<ActionResult<{ key: string }>> {
    try {
        // 1. Validation UI schema
        const validated = DisplayToggleFormSchema.parse(input);

        // 2. DAL call
        const result = await updateDisplayToggle(validated.key, {
            enabled: validated.enabled,
            max_items: validated.max_items,
        });

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        // 3. ✅ Revalidation (UNIQUEMENT ICI)
        const pathsToRevalidate = getPathsForToggle(validated.key);
        pathsToRevalidate.forEach((path) => revalidatePath(path));

        return { success: true, data: { key: validated.key } };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

/**
 * Map toggle keys to affected paths for revalidation
 */
function getPathsForToggle(key: string): string[] {
    const pathMap: Record<string, string[]> = {
        "public:home:newsletter": ["/"],
        "public:home:partners": ["/"],
        "public:home:spectacles": ["/"],
        "public:home:news": ["/"],
        "public:presse:media_kit": ["/presse"],
    };

    return pathMap[key] || [];
}

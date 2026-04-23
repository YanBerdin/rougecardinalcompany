"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { updateDisplayToggle } from "@/lib/dal/site-config";
import { DisplayToggleFormSchema } from "@/lib/schemas/site-config";
import type { ActionResult } from "./types";
import { requireAdminOnly } from "@/lib/auth/roles";

/**
 * Update display toggle action
 * Revalidates affected paths automatically
 */
export async function updateDisplayToggleAction(
    input: unknown
): Promise<ActionResult<{ key: string }>> {
    try {
        await requireAdminOnly();

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
    const ADMIN_PATH = "/admin/site-config";

    const pathMap: Record<string, string[]> = {
        "display_toggle_home_about": ["/", ADMIN_PATH],
        "display_toggle_home_newsletter": ["/", ADMIN_PATH],
        "display_toggle_home_partners": ["/", ADMIN_PATH],
        "display_toggle_home_spectacles": ["/", ADMIN_PATH],
        "display_toggle_home_a_la_une": ["/", ADMIN_PATH],
        "display_toggle_media_kit": ["/presse", ADMIN_PATH],
        "display_toggle_presse_articles": ["/presse", ADMIN_PATH],
        "display_toggle_agenda_newsletter": ["/agenda", ADMIN_PATH],
        "display_toggle_contact_newsletter": ["/contact", ADMIN_PATH],
    };

    return pathMap[key] ?? [ADMIN_PATH];
}

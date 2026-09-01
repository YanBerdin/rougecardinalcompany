"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { updateFooterConfig } from "@/lib/dal/footer-config";
import { FooterConfigFormSchema } from "@/lib/schemas/footer-config";
import { requireAdminOnly } from "@/lib/auth/roles";
import type { ActionResult } from "./types";

/**
 * Update footer configuration action.
 *
 * Affects:
 * - `/` (and all marketing routes via layout revalidation) — the public footer
 * - `/admin/footer` — the admin form itself
 */
export async function updateFooterConfigAction(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireAdminOnly();

        const validated = await FooterConfigFormSchema.parseAsync(input);

        const result = await updateFooterConfig(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        // Revalidate the marketing layout (footer is rendered there) + admin page.
        revalidatePath("/", "layout");
        revalidatePath("/admin/footer");

        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

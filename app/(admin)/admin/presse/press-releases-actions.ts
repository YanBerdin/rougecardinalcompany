"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
import {
    PressReleaseInputSchema,
    PublishPressReleaseSchema,
    type PressReleaseInput,
} from "@/lib/schemas/press-release";
import {
    createPressRelease,
    updatePressRelease,
    deletePressRelease,
    publishPressRelease,
    unpublishPressRelease,
} from "@/lib/dal/admin-press-releases";

// =============================================================================
// PRESS RELEASES ACTIONS
// =============================================================================

/**
 * CREATE press release action
 */
export async function createPressReleaseAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: PressReleaseInput = await PressReleaseInputSchema.parseAsync(input);
        const result = await createPressRelease(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE press release action
 */
export async function updatePressReleaseAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        const validated = await PressReleaseInputSchema.partial().parseAsync(input);
        const result = await updatePressRelease(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE press release action
 */
export async function deletePressReleaseAction(
    id: string
): Promise<ActionResult> {
    try {
        const result = await deletePressRelease(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * PUBLISH press release action
 */
export async function publishPressReleaseAction(
    id: string
): Promise<ActionResult> {
    try {
        const validated = PublishPressReleaseSchema.parse({
            id: BigInt(id),
            public: true,
        });
        const result = await publishPressRelease(validated.id);

        if (!result.success) {
            return { success: false, error: result.error ?? "Publish failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UNPUBLISH press release action
 */
export async function unpublishPressReleaseAction(
    id: string
): Promise<ActionResult> {
    try {
        const validated = PublishPressReleaseSchema.parse({
            id: BigInt(id),
            public: false,
        });
        const result = await unpublishPressRelease(validated.id);

        if (!result.success) {
            return { success: false, error: result.error ?? "Unpublish failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

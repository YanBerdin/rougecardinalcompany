"use server";

import { revalidatePath } from "next/cache";
import {
    PartnerInputSchema,
    ReorderPartnersSchema,
    type PartnerInput,
    type ReorderPartnersInput,
} from "@/lib/schemas/partners";
import {
    createPartner,
    updatePartner,
    deletePartner,
    reorderPartners,
} from "@/lib/dal/admin-partners";

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };

/**
 * CREATE partner action
 */
export async function createPartnerAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: PartnerInput = await PartnerInputSchema.parseAsync(input);
        const result = await createPartner(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/partners");
        revalidatePath("/"); // Homepage partners section

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE partner action
 */
export async function updatePartnerAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        const validated = await PartnerInputSchema.partial().parseAsync(input);
        const result = await updatePartner(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/partners");
        revalidatePath("/"); // Homepage partners section

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE partner action
 */
export async function deletePartnerAction(id: string): Promise<ActionResult> {
    try {
        const result = await deletePartner(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/partners");
        revalidatePath("/"); // Homepage partners section

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * REORDER partners action (drag-and-drop)
 */
export async function reorderPartnersAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: ReorderPartnersInput = ReorderPartnersSchema.parse(input);
        const result = await reorderPartners(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Reorder failed" };
        }

        revalidatePath("/admin/partners");
        revalidatePath("/"); // Homepage partners section

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

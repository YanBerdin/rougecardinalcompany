"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
import {
    PressContactInputSchema,
    TogglePressContactActiveSchema,
    type PressContactInput,
} from "@/lib/schemas/press-contact";
import {
    createPressContact,
    updatePressContact,
    deletePressContact,
    togglePressContactActive,
} from "@/lib/dal/admin-press-contacts";

// =============================================================================
// PRESS CONTACTS ACTIONS
// =============================================================================

/**
 * CREATE press contact action
 */
export async function createPressContactAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: PressContactInput = await PressContactInputSchema.parseAsync(input);
        const result = await createPressContact(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE press contact action
 */
export async function updatePressContactAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        const validated = await PressContactInputSchema.partial().parseAsync(input);
        const result = await updatePressContact(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE press contact action
 */
export async function deletePressContactAction(
    id: string
): Promise<ActionResult> {
    try {
        const result = await deletePressContact(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * TOGGLE press contact active status action
 */
export async function togglePressContactActiveAction(
    id: string,
    actif: boolean
): Promise<ActionResult> {
    try {
        const validated = await TogglePressContactActiveSchema.parseAsync({
            id: BigInt(id),
            actif,
        });
        const result = await togglePressContactActive(validated.id, validated.actif);

        if (!result.success) {
            return { success: false, error: result.error ?? "Toggle failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

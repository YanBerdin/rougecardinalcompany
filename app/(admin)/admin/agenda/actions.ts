"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    createEvent,
    updateEvent,
    deleteEvent,
} from "@/lib/dal/admin-agenda";
import { EventInputSchema } from "@/lib/schemas/admin-agenda";
import type { EventDTO } from "@/lib/schemas/admin-agenda";

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string; details?: unknown };

/**
 * CREATE Event
 */
export async function createEventAction(
    input: unknown
): Promise<ActionResult<EventDTO>> {
    try {
        // 1. Validation Zod
        const validated = EventInputSchema.parse(input);

        // 2. Appel DAL
        const result = await createEvent(validated);
        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        // 3. ✅ Revalidation UNIQUEMENT ICI (pas dans DAL)
        revalidatePath("/admin/agenda");
        revalidatePath("/agenda"); // Page publique

        return { success: true, data: result.data };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation échouée",
                details: err.issues,
            };
        }
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}

/**
 * UPDATE Event
 */
export async function updateEventAction(
    id: string,
    input: unknown
): Promise<ActionResult<EventDTO>> {
    try {
        const validated = EventInputSchema.partial().parse(input);
        const result = await updateEvent(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/agenda");
        revalidatePath("/agenda");

        return { success: true, data: result.data };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation échouée",
                details: err.issues,
            };
        }
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}

/**
 * DELETE Event
 */
export async function deleteEventAction(
    id: string
): Promise<ActionResult<null>> {
    try {
        const result = await deleteEvent(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/agenda");
        revalidatePath("/agenda");

        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}

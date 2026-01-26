"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    createEvent,
    updateEvent,
    deleteEvent,
} from "@/lib/dal/admin-agenda";
import { EventFormSchema } from "@/lib/schemas/admin-agenda-ui";
import type { EventInput } from "@/lib/schemas/admin-agenda";

// ✅ Type simplifié sans données - évite problèmes de sérialisation BigInt
export type ActionResult =
    | { success: true }
    | { success: false; error: string };

/**
 * Type intermédiaire pour le transport de données
 * IDs en string avant conversion BigInt dans le DAL
 */
type EventDataTransport = Omit<EventInput, 'spectacle_id' | 'lieu_id'> & {
    spectacle_id: string;
    lieu_id: string | null;
};

/**
 * CREATE Event
 */
export async function createEventAction(
    input: unknown
): Promise<ActionResult> {
    try {
        // 1. Validation avec schéma UI (number IDs) - Pas de BigInt ici !
        const validated = EventFormSchema.parse(input);

        // 2. Préparer les données pour le DAL (format serveur, mais IDs en string)
        const eventData: EventDataTransport = {
            spectacle_id: String(validated.spectacle_id),
            lieu_id: validated.lieu_id !== null && validated.lieu_id !== undefined 
                ? String(validated.lieu_id) 
                : null,
            date_debut: `${validated.date_debut}:00.000Z`,
            date_fin: validated.date_fin ? `${validated.date_fin}:00.000Z` : null,
            start_time: `${validated.start_time}:00`,
            end_time: validated.end_time ? `${validated.end_time}:00` : null,
            status: validated.status,
            ticket_url: validated.ticket_url ?? null,
            capacity: validated.capacity ?? null,
            price_cents: validated.price_cents ?? null,
        };

        // 3. Appel DAL (qui convertira string → bigint)
        const result = await createEvent(eventData as unknown as EventInput);
        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        // 4. ✅ Revalidation UNIQUEMENT ICI (pas dans DAL)
        revalidatePath("/admin/agenda");
        revalidatePath("/agenda");

        return { success: true };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return {
                success: false,
                error: `Validation échouée: ${err.issues.map(i => i.message).join(", ")}`,
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
): Promise<ActionResult> {
    try {
        // 1. Validation avec schéma UI (number IDs)
        const validated = EventFormSchema.partial().parse(input);

        // 2. Préparer les données (format serveur, IDs en string)
        const eventData: Partial<EventDataTransport> = {};
        
        if (validated.spectacle_id !== undefined) {
            eventData.spectacle_id = String(validated.spectacle_id); // ✅ String
        }
        if (validated.lieu_id !== undefined) {
            eventData.lieu_id = validated.lieu_id !== null ? String(validated.lieu_id) : null;
        }
        if (validated.date_debut !== undefined) {
            eventData.date_debut = `${validated.date_debut}:00.000Z`;
        }
        if (validated.date_fin !== undefined) {
            eventData.date_fin = validated.date_fin ? `${validated.date_fin}:00.000Z` : null;
        }
        if (validated.start_time !== undefined) {
            eventData.start_time = `${validated.start_time}:00`;
        }
        if (validated.end_time !== undefined) {
            eventData.end_time = validated.end_time ? `${validated.end_time}:00` : null;
        }
        if (validated.status !== undefined) {
            eventData.status = validated.status;
        }
        if (validated.ticket_url !== undefined) {
            eventData.ticket_url = validated.ticket_url ?? null;
        }
        if (validated.capacity !== undefined) {
            eventData.capacity = validated.capacity ?? null;
        }
        if (validated.price_cents !== undefined) {
            eventData.price_cents = validated.price_cents ?? null;
        }
        
        // 3. Appel DAL avec ID converti en bigint
        const result = await updateEvent(BigInt(id), eventData as Partial<EventInput>);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        // 4. Revalidation
        revalidatePath("/admin/agenda");
        revalidatePath("/agenda");

        return { success: true };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return {
                success: false,
                error: `Validation échouée: ${err.issues.map(i => i.message).join(", ")}`,
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
): Promise<ActionResult> {
    try {
        // ✅ Conversion string → bigint pour le DAL
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

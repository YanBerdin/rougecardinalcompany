"use server";
import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult, dalSuccess, dalError, getErrorMessage } from "@/lib/dal/helpers";

const ReorderItemSchema = z.object({
    id: z.number().int().positive(),
    ordre: z.number().int(),
});

const ReorderSchema = z
    .array(ReorderItemSchema)
    .min(1)
    .refine((arr) => new Set(arr.map((i) => i.id)).size === arr.length, {
        message: "Duplicate id in updates",
    })
    .refine((arr) => new Set(arr.map((i) => i.ordre)).size === arr.length, {
        message: "Duplicate ordre in updates",
    });

/**
 * Reorders team members by updating their display order atomically.
 *
 * Uses a single atomic RPC call to prevent partial updates.
 * Validates that all IDs and order values are unique.
 *
 * @param updates - Array of { id, ordre } pairs to update
 */
export async function reorderTeamMembers(
    updates: { id: number; ordre: number }[]
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const validated = ReorderSchema.safeParse(updates as unknown);
        if (!validated.success) {
            console.error("[ERR_TEAM_040] reorderTeamMembers: invalid updates:", validated.error);
            return dalError("[ERR_TEAM_040] Invalid reorder payload");
        }

        const supabase = await createClient();
        const { error } = await supabase.rpc("reorder_team_members", {
            items: validated.data,
        });

        if (error) {
            console.error("[ERR_TEAM_041] reorderTeamMembers rpc error:", error);
            return dalError(`[ERR_TEAM_041] ${getErrorMessage(error)}`);
        }

        return dalSuccess(null);
    } catch (err: unknown) {
        console.error("reorderTeamMembers exception:", err);
        return dalError(getErrorMessage(err));
    }
}

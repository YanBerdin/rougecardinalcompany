"use server";

import "server-only";

import { createClient } from "@/supabase/server";
import { PasswordWithConfirmationSchema } from "@/lib/schemas/auth";
import { isRoleAtLeast, normalizeRole } from "@/lib/auth/role-helpers";
import type { ActionResult } from "./types";

/**
 * Server Action: setupAccountAction
 *
 * Finalise la configuration d'un compte invité en définissant le mot de passe
 * côté serveur. Lit le rôle depuis `app_metadata.role` (JWT signé) pour
 * calculer le chemin de redirection — jamais depuis `user_metadata` (modifiable
 * par l'utilisateur).
 *
 * Sécurité :
 *   - Validation Zod du mot de passe (OWASP ASVS v4 L2 : min 12 chars + 4 classes)
 *   - Vérifie qu'une session utilisateur existe avant la mutation
 *   - Calcule la redirection à partir de claims serveur, pas d'input client
 */
export async function setupAccountAction(
    input: unknown
): Promise<ActionResult<{ redirectPath: string }>> {
    try {
        const validated = PasswordWithConfirmationSchema.parse(input);

        const supabase = await createClient();

        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
        if (claimsError || !claimsData?.claims) {
            return { success: false, error: "Session expirée. Veuillez vous reconnecter." };
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: validated.password,
        });

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        const appMetadata = claimsData.claims.app_metadata as
            | { role?: unknown }
            | undefined;
        const role = normalizeRole(appMetadata?.role);
        const redirectPath = isRoleAtLeast(role, "editor") ? "/admin" : "/";

        return { success: true, data: { redirectPath } };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}

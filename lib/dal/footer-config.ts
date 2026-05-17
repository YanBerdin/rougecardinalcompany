"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdminOnly } from "@/lib/auth/roles";
import {
    FOOTER_CONFIG_KEY,
    FOOTER_DEFAULTS,
    FooterConfigInputSchema,
    type FooterConfigDTO,
    type FooterConfigInput,
} from "@/lib/schemas/footer-config";
import { dalError, dalSuccess, type DALResult } from "./helpers";

/**
 * Fetch footer configuration (public read).
 *
 * Wrapped with React `cache()` for intra-request deduplication.
 *
 * Defense-in-depth fallback: any DB error or missing/invalid row resolves
 * to `FOOTER_DEFAULTS` to keep the public footer rendering correctly.
 *
 * @returns The footer config DTO (never errors out from caller perspective
 *   for public reads; falls back to defaults).
 */
export const fetchFooterConfig = cache(
    async (): Promise<DALResult<FooterConfigDTO>> => {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("configurations_site")
            .select("value")
            .eq("key", FOOTER_CONFIG_KEY)
            .maybeSingle();

        if (error) {
            console.error("[DAL] fetchFooterConfig error:", {
                code: error.code,
                message: error.message,
                details: error.details,
            });
            // Public read: never break the footer — fall back to defaults.
            return dalSuccess(FOOTER_DEFAULTS);
        }

        if (!data?.value) {
            return dalSuccess(FOOTER_DEFAULTS);
        }

        const parsed = FooterConfigInputSchema.safeParse(data.value);
        if (!parsed.success) {
            console.error(
                "[DAL] fetchFooterConfig [ERR_FOOTER_001] invalid stored value, using defaults",
                parsed.error.issues
            );
            return dalSuccess(FOOTER_DEFAULTS);
        }

        return dalSuccess(parsed.data);
    }
);

/**
 * Update the footer configuration.
 *
 * IMPORTANT: requires admin privileges (enforced via `requireAdminOnly()`).
 * The RLS policy on `configurations_site` is the second line of defense.
 *
 * @param input - Validated payload (server schema)
 */
export async function updateFooterConfig(
    input: FooterConfigInput
): Promise<DALResult<FooterConfigDTO>> {
    await requireAdminOnly();

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("configurations_site")
        .upsert(
            {
                key: FOOTER_CONFIG_KEY,
                value: input,
                category: "footer_content",
                description:
                    "Contenu administrable du footer public (description, contact, réseaux sociaux).",
                updated_at: new Date().toISOString(),
                updated_by: user?.id,
            },
            { onConflict: "key" }
        )
        .select("value")
        .single();

    if (error) {
        console.error("[DAL] updateFooterConfig error:", {
            code: error.code,
            message: error.message,
            details: error.details,
        });
        return dalError(
            `[ERR_FOOTER_002] ${error.message ?? error.details ?? error.code ?? "Erreur inconnue"}`
        );
    }

    const parsed = FooterConfigInputSchema.safeParse(data?.value);
    if (!parsed.success) {
        return dalError("[ERR_FOOTER_003] Stored value invalid after upsert");
    }

    return dalSuccess(parsed.data);
}

"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { dalSuccess, dalError, type DALResult } from "@/lib/dal/helpers";
import { type SelectOptionDTO } from "@/lib/schemas/press-release";

/**
 * Fetch spectacles for select dropdown options
 */
export const fetchSpectaclesForSelect = cache(
    async (): Promise<DALResult<SelectOptionDTO[]>> => {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("spectacles")
            .select("id, titre")
            .eq("active", true)
            .order("titre", { ascending: true });

        if (error) {
            return dalError(`[ERR_SELECT_OPT_001] ${error.message}`);
        }

        const options: SelectOptionDTO[] = (data ?? []).map((item) => ({
            id: Number(item.id),
            titre: item.titre,
        }));

        return dalSuccess(options);
    }
);

/**
 * Fetch evenements for select dropdown options
 */
export const fetchEvenementsForSelect = cache(
    async (): Promise<DALResult<SelectOptionDTO[]>> => {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("evenements")
            .select("id, titre")
            .eq("active", true)
            .order("titre", { ascending: true });

        if (error) {
            return dalError(`[ERR_SELECT_OPT_002] ${error.message}`);
        }

        const options: SelectOptionDTO[] = (data ?? []).map((item) => ({
            id: Number(item.id),
            titre: item.titre,
        }));

        return dalSuccess(options);
    }
);

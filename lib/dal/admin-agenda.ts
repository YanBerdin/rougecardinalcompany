"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { dalSuccess, dalError } from "@/lib/dal/helpers/error";
import type { DALResult } from "@/lib/dal/helpers/error";
import type { EventInput, EventDTO, LieuDTO } from "@/lib/schemas/admin-agenda";

/**
 * Fetch all events with joins (admin)
 */
export const fetchAllEventsAdmin = cache(
    async (): Promise<DALResult<EventDTO[]>> => {
        await requireAdmin();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("evenements")
            .select(
                `
        id,
        spectacle_id,
        lieu_id,
        date_debut,
        date_fin,
        start_time,
        end_time,
        status,
        ticket_url,
        capacity,
        price_cents,
        created_at,
        updated_at,
        spectacles (title),
        lieux (nom, ville)
      `
            )
            .order("date_debut", { ascending: false });

        if (error) {
            return dalError(`[ERR_AGENDA_001] ${error.message}`);
        }

        const events: EventDTO[] = (data ?? []).map((row) => {
            const spectacle = Array.isArray(row.spectacles) ? row.spectacles[0] : row.spectacles;
            const lieu = Array.isArray(row.lieux) ? row.lieux[0] : row.lieux;

            return {
                id: row.id,
                spectacle_id: row.spectacle_id,
                spectacle_titre: spectacle?.title,
                lieu_id: row.lieu_id,
                lieu_nom: lieu?.nom,
                lieu_ville: lieu?.ville,
                date_debut: row.date_debut,
                date_fin: row.date_fin,
                start_time: row.start_time,
                end_time: row.end_time,
                status: row.status,
                ticket_url: row.ticket_url,
                capacity: row.capacity,
                price_cents: row.price_cents,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        });

        return dalSuccess(events);
    }
);

/**
 * Fetch single event by ID (admin)
 */
export const fetchEventByIdAdmin = cache(
    async (id: bigint): Promise<DALResult<EventDTO | null>> => {
        await requireAdmin();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("evenements")
            .select(
                `
        id,
        spectacle_id,
        lieu_id,
        date_debut,
        date_fin,
        start_time,
        end_time,
        status,
        ticket_url,
        capacity,
        price_cents,
        created_at,
        updated_at,
        spectacles (title),
        lieux (nom, ville)
      `
            )
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return dalSuccess(null);
            }
            return dalError(`[ERR_AGENDA_002] ${error.message}`);
        }

        const spectacle = Array.isArray(data.spectacles) ? data.spectacles[0] : data.spectacles;
        const lieu = Array.isArray(data.lieux) ? data.lieux[0] : data.lieux;

        const event: EventDTO = {
            id: data.id,
            spectacle_id: data.spectacle_id,
            spectacle_titre: spectacle?.title,
            lieu_id: data.lieu_id,
            lieu_nom: lieu?.nom,
            lieu_ville: lieu?.ville,
            date_debut: data.date_debut,
            date_fin: data.date_fin,
            start_time: data.start_time,
            end_time: data.end_time,
            status: data.status,
            ticket_url: data.ticket_url,
            capacity: data.capacity,
            price_cents: data.price_cents,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };

        return dalSuccess(event);
    }
);

/**
 * Create event
 */
export async function createEvent(
    input: EventInput
): Promise<DALResult<EventDTO>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("evenements")
        .insert(input)
        .select(
            `
      id,
      spectacle_id,
      lieu_id,
      date_debut,
      date_fin,
      start_time,
      end_time,
      status,
      ticket_url,
      capacity,
      price_cents,
      created_at,
      updated_at,
      spectacles (title),
      lieux (nom, ville)
    `
        )
        .single();

    if (error) {
        return dalError(`[ERR_AGENDA_003] ${error.message}`);
    }

    const spectacle = Array.isArray(data.spectacles) ? data.spectacles[0] : data.spectacles;
    const lieu = Array.isArray(data.lieux) ? data.lieux[0] : data.lieux;

    const event: EventDTO = {
        id: data.id,
        spectacle_id: data.spectacle_id,
        spectacle_titre: spectacle?.title,
        lieu_id: data.lieu_id,
        lieu_nom: lieu?.nom,
        lieu_ville: lieu?.ville,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status,
        ticket_url: data.ticket_url,
        capacity: data.capacity,
        price_cents: data.price_cents,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return dalSuccess(event);
}

/**
 * Update event
 */
export async function updateEvent(
    id: bigint,
    input: Partial<EventInput>
): Promise<DALResult<EventDTO>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("evenements")
        .update(input)
        .eq("id", id)
        .select(
            `
      id,
      spectacle_id,
      lieu_id,
      date_debut,
      date_fin,
      start_time,
      end_time,
      status,
      ticket_url,
      capacity,
      price_cents,
      created_at,
      updated_at,
      spectacles (title),
      lieux (nom, ville)
    `
        )
        .single();

    if (error) {
        return dalError(`[ERR_AGENDA_004] ${error.message}`);
    }

    const spectacle = Array.isArray(data.spectacles) ? data.spectacles[0] : data.spectacles;
    const lieu = Array.isArray(data.lieux) ? data.lieux[0] : data.lieux;

    const event: EventDTO = {
        id: data.id,
        spectacle_id: data.spectacle_id,
        spectacle_titre: spectacle?.title,
        lieu_id: data.lieu_id,
        lieu_nom: lieu?.nom,
        lieu_ville: lieu?.ville,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status,
        ticket_url: data.ticket_url,
        capacity: data.capacity,
        price_cents: data.price_cents,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return dalSuccess(event);
}

/**
 * Delete event
 */
export async function deleteEvent(id: bigint): Promise<DALResult<null>> {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase.from("evenements").delete().eq("id", id);

    if (error) {
        return dalError(`[ERR_AGENDA_005] ${error.message}`);
    }

    return dalSuccess(null);
}

/**
 * Fetch all lieux (helper for select)
 * 
 * Note: Utilise la table 'lieux' (pas 'lieux_evenements').
 * Retourne tous les lieux pour le select dans le formulaire événement.
 */
export const fetchAllLieux = cache(async (): Promise<DALResult<LieuDTO[]>> => {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("lieux")
        .select("id, nom, ville, adresse")
        .order("nom", { ascending: true });

    if (error) {
        console.error("[ERR_AGENDA_006] Failed to fetch lieux:", error);
        return dalError(`[ERR_AGENDA_006] ${error.message}`);
    }

    return dalSuccess(data ?? []);
});

"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult } from "@/lib/dal/helpers";
import {
    type PressContactDTO,
    type PressContactInput,
} from "@/lib/schemas/press-contact";

/**
 * Fetch all press contacts (admin only)
 */
export async function fetchAllPressContacts(): Promise<
    DALResult<PressContactDTO[]>
> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts_presse")
        .select(
            `
      id,
      nom,
      prenom,
      fonction,
      media,
      email,
      telephone,
      adresse,
      ville,
      specialites,
      notes,
      actif,
      derniere_interaction,
      created_by,
      created_at,
      updated_at
    `
        )
        .order("nom", { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    const contacts: PressContactDTO[] = (data ?? []).map((contact) => ({
        id: Number(contact.id),
        nom: contact.nom,
        prenom: contact.prenom,
        fonction: contact.fonction,
        media: contact.media,
        email: contact.email,
        telephone: contact.telephone,
        adresse: contact.adresse,
        ville: contact.ville,
        specialites: contact.specialites,
        notes: contact.notes,
        actif: contact.actif,
        derniere_interaction: contact.derniere_interaction,
        created_by: contact.created_by,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
    }));

    return { success: true, data: contacts };
}

/**
 * Fetch single press contact by ID
 */
export async function fetchPressContactById(
    id: bigint
): Promise<DALResult<PressContactDTO | null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts_presse")
        .select(
            `
      id,
      nom,
      prenom,
      fonction,
      media,
      email,
      telephone,
      adresse,
      ville,
      specialites,
      notes,
      actif,
      derniere_interaction,
      created_by,
      created_at,
      updated_at
    `
        )
        .eq("id", id.toString())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
    }

    const contact: PressContactDTO = {
        id: Number(data.id),
        nom: data.nom,
        prenom: data.prenom,
        fonction: data.fonction,
        media: data.media,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        ville: data.ville,
        specialites: data.specialites,
        notes: data.notes,
        actif: data.actif,
        derniere_interaction: data.derniere_interaction,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return { success: true, data: contact };
}

/**
 * Create new press contact
 */
export async function createPressContact(
    input: PressContactInput
): Promise<DALResult<PressContactDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("contacts_presse")
        .insert({
            nom: input.nom,
            prenom: input.prenom,
            fonction: input.fonction,
            media: input.media,
            email: input.email,
            telephone: input.telephone,
            adresse: input.adresse,
            ville: input.ville,
            specialites: input.specialites,
            notes: input.notes,
            actif: input.actif,
            derniere_interaction: input.derniere_interaction,
            created_by: user?.id,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_CONTACT_001] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_CONTACT_001] Failed to create press contact" };
    }

    return { success: true, data };
}

/**
 * Update press contact
 */
export async function updatePressContact(
    id: bigint,
    input: Partial<PressContactInput>
): Promise<DALResult<PressContactDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts_presse")
        .update({
            nom: input.nom,
            prenom: input.prenom,
            fonction: input.fonction,
            media: input.media,
            email: input.email,
            telephone: input.telephone,
            adresse: input.adresse,
            ville: input.ville,
            specialites: input.specialites,
            notes: input.notes,
            actif: input.actif,
            derniere_interaction: input.derniere_interaction,
        })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_CONTACT_002] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_CONTACT_002] Failed to update press contact" };
    }

    return { success: true, data };
}

/**
 * Delete press contact
 */
export async function deletePressContact(
    id: bigint
): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("contacts_presse")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return { success: false, error: `[ERR_PRESS_CONTACT_003] ${error.message}` };
    }

    return { success: true, data: null };
}

/**
 * Toggle press contact active status
 */
export async function togglePressContactActive(
    id: bigint,
    actif: boolean
): Promise<DALResult<PressContactDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts_presse")
        .update({ actif })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_CONTACT_004] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_CONTACT_004] Failed to toggle active status" };
    }

    return { success: true, data };
}

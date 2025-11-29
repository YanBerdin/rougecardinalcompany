"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";
import {
  ContactMessageSchema,
  type ContactMessageInput,
} from "@/lib/schemas/contact";

// NOTE: ContactMessageInput type is exported from @/lib/schemas/contact
// Server files cannot re-export types in Next.js 15

// =============================================================================
// CREATE CONTACT MESSAGE
// =============================================================================

export async function createContactMessage(
  input: ContactMessageInput
): Promise<DALResult<{ ok: true }>> {
  const validatedInput = ContactMessageSchema.parse(input);

  const supabase = await createClient();

  const payload = {
    firstname: validatedInput.firstName,
    lastname: validatedInput.lastName,
    email: validatedInput.email,
    phone: validatedInput.phone ?? null,
    reason: validatedInput.reason,
    message: validatedInput.message,
    consent: validatedInput.consent,
    metadata: {},
  } as const;

  //? RGPD: Utilise .insert() sans .select() pour éviter les blocages RLS
  //? Seuls les admins peuvent lire les données personnelles (firstname, lastname, email, phone)
  //? L'insertion publique est autorisée pour le formulaire de contact
  const { error } = await supabase.from("messages_contact").insert(payload);

  if (error) {
    console.error("[ERR_CONTACT_001] createContactMessage failed:", error.message);
    return { success: false, error: `[ERR_CONTACT_001] ${error.message}` };
  }

  return { success: true, data: { ok: true } };
}

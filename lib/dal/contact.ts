"use server";

import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";

// Schema et type définis dans le scope local pour éviter les exports non-async
const ContactMessageSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().trim().max(40).optional().nullable(),
  reason: z
    .enum(["booking", "partenariat", "presse", "education", "technique", "autre"]) // align with DB CHECK constraint
    .default("autre"),
  message: z.string().trim().min(1).max(5000),
  consent: z.boolean().refine((v) => v === true, { message: "Consent required" }),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;

export async function createContactMessage(input: ContactMessageInput) {
  // Validation des données d'entrée
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

  const { error } = await supabase.from("messages_contact").insert(payload);
  if (error) {
    // Hide low-level details but log server-side
    console.error("createContactMessage error", error);
    throw new Error("Failed to submit contact message");
  }

  return { ok: true } as const;
}

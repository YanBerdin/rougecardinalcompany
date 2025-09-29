"use server";

import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";

export const ContactMessageSchema = z.object({
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
  const supabase = await createClient();

  const payload = {
    firstname: input.firstName,
    lastname: input.lastName,
    email: input.email,
    phone: input.phone ?? null,
    reason: input.reason,
    message: input.message,
    consent: input.consent,
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

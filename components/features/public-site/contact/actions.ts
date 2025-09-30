"use server";

import { z } from "zod";
import { createContactMessage, type ContactMessageInput } from "@/lib/dal/contact";

// Schema de validation pour le formulaire (copie du schéma DAL)
const FormSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().trim().max(40).optional().nullable(),
  reason: z
    .enum(["booking", "partenariat", "presse", "education", "technique", "autre"])
    .default("autre"),
  message: z.string().trim().min(1).max(5000),
  consent: z.boolean().refine((v) => v === true, { message: "Consent required" }),
});

export async function submitContactAction(formData: FormData) {
  // Extract and validate
  const shape = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: (() => {
      const v = formData.get("phone");
      return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
    })(),
    reason: String(formData.get("reason") ?? "autre"),
    message: String(formData.get("message") ?? "").trim(),
    consent: String(formData.get("consent") ?? "false") === "true",
  };

  const parsed = FormSchema.safeParse(shape);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", issues: parsed.error.format() } as const;
  }

  //TODO: Remove Artificial delay for skeleton testing 
  await new Promise((r) => setTimeout(r, 1500));

  await createContactMessage(parsed.data as ContactMessageInput);
  return { ok: true } as const;
}

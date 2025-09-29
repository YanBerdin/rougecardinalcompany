"use server";

import { z } from "zod";
import { ContactMessageSchema, createContactMessage } from "@/lib/dal/contact";

const FormSchema = ContactMessageSchema;

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

  // Artificial delay for skeleton testing (TODO: remove)
  await new Promise((r) => setTimeout(r, 800));

  await createContactMessage(parsed.data);
  return { ok: true } as const;
}

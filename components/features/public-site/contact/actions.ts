"use server";

import { createContactMessage } from "@/lib/dal/contact";
import { sendContactNotification } from "@/lib/email/actions";
import {
  ContactMessageSchema,
  type ContactMessageInput,
} from "@/lib/schemas/contact";

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

  const parsed = ContactMessageSchema.safeParse(shape);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      issues: parsed.error.format(),
    } as const;
  }

  //TODO: Remove Artificial delay for skeleton testing
  await new Promise((r) => setTimeout(r, 1500));

  // Persistance en base (priorité RGPD)
  const dalResult = await createContactMessage(parsed.data as ContactMessageInput);
  if (!dalResult.success) {
    console.error("[Contact Action] DAL error:", dalResult.error);
    return { ok: false, error: "Database error" } as const;
  }

  // Envoi notification email admin
  // Note: Le schéma API attend 'name' et 'subject', mais la DAL a 'firstName'/'lastName'
  // On reconstruit le format attendu par sendContactNotification
  try {
    await sendContactNotification({
      name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
      email: parsed.data.email,
      subject: "Message depuis le formulaire de contact", // TODO: Extraire le sujet si présent dans message
      message: parsed.data.message,
      phone: parsed.data.phone || undefined,
      reason: parsed.data.reason,
    });
  } catch (emailError) {
    console.error("[Contact Action] Email notification failed:", emailError);
    // Ne pas échouer l'action si l'email échoue (message déjà en BDD)
  }

  return { ok: true } as const;
}

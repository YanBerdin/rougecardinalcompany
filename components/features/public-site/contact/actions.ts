"use server";

import "server-only";
import { headers } from "next/headers";
import { createContactMessage } from "@/lib/dal/contact";
import { sendContactNotification } from "@/lib/email/actions";
import { ContactMessageSchema } from "@/lib/schemas/contact";
import { recordRequest } from "@/lib/utils/rate-limit";
import { getClientIP } from "@/lib/utils/get-client-ip";
import type { ActionResult } from "@/lib/actions/types";

const MAX_CONTACT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function submitContactAction(
  formData: FormData,
): Promise<ActionResult> {
  const headersList = await headers();
  const clientIP = getClientIP(headersList);

  const rateCheck = recordRequest(
    `contact:${clientIP}`,
    MAX_CONTACT_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!rateCheck.success) {
    return { success: false, error: "Trop de messages envoyés. Réessayez plus tard." };
  }

  const rawPhone = formData.get("phone");
  const shape = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone:
      typeof rawPhone === "string" && rawPhone.trim().length > 0
        ? rawPhone.trim()
        : null,
    reason: String(formData.get("reason") ?? "autre"),
    message: String(formData.get("message") ?? "").trim(),
    consent: String(formData.get("consent") ?? "false") === "true",
  };

  const parsed = ContactMessageSchema.safeParse(shape);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message ?? "Données invalides",
    };
  }

  const dalResult = await createContactMessage(parsed.data);
  if (!dalResult.success) {
    console.error("[Contact Action] DAL error:", dalResult.error);
    return { success: false, error: "Erreur serveur. Réessayez plus tard." };
  }

  try {
    await sendContactNotification({
      name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
      email: parsed.data.email,
      subject: "Message depuis le formulaire de contact",
      message: parsed.data.message,
      phone: parsed.data.phone ?? undefined,
      reason: parsed.data.reason,
    });
  } catch (emailError: unknown) {
    console.error("[Contact Action] Email notification failed:", emailError);
  }

  return { success: true };
}

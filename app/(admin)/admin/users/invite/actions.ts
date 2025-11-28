"use server";

import { revalidatePath } from "next/cache";
import { inviteUserWithoutEmail } from "@/lib/dal/admin-users";
import { sendInvitationEmail } from "@/lib/email/actions";

export type ActionResult<T = null> =
  | { success: true; data?: T; warning?: string }
  | { success: false; error: string };

/**
 * Invite un utilisateur (création + envoi email)
 * 
 * Pattern Warning: L'email est envoyé séparément du DAL.
 * Si l'email échoue, l'utilisateur est quand même créé (warning retourné).
 */
export async function inviteUser(input: {
  email: string;
  role: "user" | "editor" | "admin";
  displayName?: string;
}): Promise<ActionResult<{ userId: string }>> {
  // 1. Création utilisateur via DAL (sans email)
  const result = await inviteUserWithoutEmail(input);

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error ?? "Invite failed",
    };
  }

  const { userId, invitationUrl } = result.data;

  // 2. Envoi email (Pattern Warning - ne fait pas échouer l'action)
  let emailSent = true;
  try {
    await sendInvitationEmail({
      email: input.email,
      role: input.role,
      displayName: input.displayName,
      invitationUrl,
    });
  } catch (emailError) {
    console.error("[Action] Email send failed:", emailError);
    emailSent = false;
  }

  // 3. Revalidation
  revalidatePath("/admin/users");

  // 4. Retour avec warning si email échoué
  if (!emailSent) {
    return {
      success: true,
      data: { userId },
      warning: "Utilisateur créé mais l'email d'invitation n'a pas pu être envoyé. Veuillez renvoyer l'invitation manuellement.",
    };
  }

  return { success: true, data: { userId } };
}

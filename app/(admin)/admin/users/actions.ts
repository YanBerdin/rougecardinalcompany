"use server";

import { revalidatePath } from "next/cache";
import {
  updateUserRole as updateUserRoleDAL,
  deleteUser as deleteUserDAL,
  inviteUserWithoutEmail as inviteUserDAL,
} from "@/lib/dal/admin-users";
import { sendInvitationEmail } from "@/lib/email/actions";

export type ActionResult<T = null> =
  | { success: true; data?: T; warning?: string }
  | { success: false; error: string };

/**
 * Invite a new user via email
 * DAL handles database logic, action handles email + revalidation
 *
 * Pattern Warning: Si l'email échoue, l'utilisateur est quand même créé
 * et un warning est retourné (pas un échec).
 */
export async function inviteUser(input: {
  email: string;
  role: "user" | "editor" | "admin";
  displayName?: string;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    // 1. Create user in database (returns invitationUrl)
    const result = await inviteUserDAL(input);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const { userId, invitationUrl } = result.data;

    // 2. Send invitation email with the generated URL
    let emailSent = true;
    try {
      await sendInvitationEmail({
        email: input.email,
        role: input.role,
        displayName: input.displayName,
        invitationUrl,
      });
    } catch (emailError) {
      console.error("[inviteUser] Email failed:", emailError);
      emailSent = false;
    }

    // 3. Revalidation
    revalidatePath("/admin/users");

    // 4. Return with warning if email failed
    if (!emailSent) {
      return {
        success: true,
        data: { userId },
        warning:
          "Utilisateur créé mais l'email d'invitation n'a pas pu être envoyé. Veuillez renvoyer l'invitation manuellement.",
      };
    }

    return { success: true, data: { userId } };
  } catch (error) {
    // Catch any unexpected errors (validation, network, etc.)
    console.error("[inviteUser] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue lors de l'invitation",
    };
  }
}

export async function updateUserRole(input: {
  userId: string;
  role: "user" | "editor" | "admin";
}): Promise<ActionResult> {
  const result = await updateUserRoleDAL(input);

  if (!result.success) {
    return { success: false, error: result.error ?? "Update failed" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const result = await deleteUserDAL(userId);

  if (!result.success) {
    return { success: false, error: result.error ?? "Delete failed" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

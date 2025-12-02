"use server";

import { revalidatePath } from "next/cache";
import {
  updateUserRole as updateUserRoleDAL,
  deleteUser as deleteUserDAL,
  inviteUserWithoutEmail as inviteUserDAL,
} from "@/lib/dal/admin-users";
import { sendInvitationEmail } from "@/lib/email/actions";

export type ActionResult<T = null> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Invite a new user via email
 * DAL handles database logic, action handles email + revalidation
 */
export async function inviteUserAction(input: {
  email: string;
  role: "user" | "editor" | "admin";
  displayName?: string;
}): Promise<ActionResult> {
  // 1. Create user in database (returns invitationUrl)
  const result = await inviteUserDAL(input);

  if (!result.success || !result.data) {
    return { success: false, error: result.error ?? "Invitation failed" };
  }

  // 2. Send invitation email with the generated URL
  try {
    await sendInvitationEmail({
      email: input.email,
      role: input.role,
      displayName: input.displayName,
      invitationUrl: result.data.invitationUrl,
    });
  } catch (emailError) {
    console.error("[inviteUserAction] Email failed:", emailError);
    // Don't fail the action if email fails - user is already created
  }

  revalidatePath("/admin/users");
  return { success: true };
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

"use server";

import { revalidatePath } from "next/cache";
import {
  updateUserRole as updateUserRoleDAL,
  deleteUser as deleteUserDAL,
} from "@/lib/dal/admin-users";

export type ActionResult<T = null> =
  | { success: true; data?: T }
  | { success: false; error: string };

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

"use server";

import {
  updateUserRole as updateUserRoleDAL,
  deleteUser as deleteUserDAL,
} from "@/lib/dal/admin-users";

export async function updateUserRole(input: {
  userId: string;
  role: "user" | "editor" | "admin";
}) {
  return await updateUserRoleDAL(input);
}

export async function deleteUser(userId: string) {
  return await deleteUserDAL(userId);
}

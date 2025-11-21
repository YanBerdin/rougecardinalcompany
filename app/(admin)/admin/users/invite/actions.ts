"use server";

import { inviteUser as inviteUserDAL } from "@/lib/dal/admin-users";

export async function inviteUser(input: {
  email: string;
  role: "user" | "editor" | "admin";
  displayName?: string;
}) {
  return await inviteUserDAL(input);
}

"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/is-admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  invited_at: string | null;
  profile: {
    role: string;
    display_name: string | null;
  } | null;
}

const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid({ message: "UUID utilisateur invalide" }),
  role: z.enum(["user", "editor", "admin"], {
    message: "Rôle invalide",
  }),
});

type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

const InviteUserSchema = z.object({
  email: z
    .string()
    .email({ message: "Email invalide" })
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        const blockedDomains = [
          "tempmail.com",
          "10minutemail.com",
          "guerrillamail.com",
          "mailinator.com",
          "throwaway.email",
        ];
        return !blockedDomains.includes(domain);
      },
      {
        message:
          "Domaine email non autorisé (domaines jetables interdits)",
      }
    )
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        const commonTypos: Record<string, string> = {
          "gmial.com": "gmail.com",
          "gmai.com": "gmail.com",
          "yahooo.com": "yahoo.com",
          "outlok.com": "outlook.com",
        };
        if (commonTypos[domain]) {
          throw new Error(
            `Vérifiez l'orthographe du domaine email (vouliez-vous dire ${commonTypos[domain]} ?)`
          );
        }
        return true;
      },
      { message: "Vérifiez l'orthographe du domaine email" }
    ),
  role: z.enum(["user", "editor", "admin"], {
    message: "Rôle invalide",
  }),
  displayName: z
    .string()
    .min(2, { message: "Nom doit contenir au moins 2 caractères" })
    .optional()
    .or(z.literal("")),
});

type InviteUserInput = z.infer<typeof InviteUserSchema>;

interface DALResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
}

function sanitizeEmailForLogs(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email; // Invalid email, return as-is
  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local[0] + '*';
  return `${maskedLocal}@${domain}`;
}

export async function listAllUsers(): Promise<UserWithProfile[]> {
  await requireAdmin();

  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const {
    data: { users },
    error: usersError,
  } = await adminClient.auth.admin.listUsers();

  if (usersError) {
    console.error("[DAL] Failed to fetch users:", usersError);
    throw new Error(`Failed to fetch users: ${usersError.message}`);
  }

  const userIds: string[] = users.map((u): string => u.id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, role, display_name")
    .in("user_id", userIds);

  if (profilesError) {
    console.error("[DAL] Failed to fetch profiles:", profilesError);
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  return users.map((user: { id: string; email?: string | null; created_at: string; email_confirmed_at?: string | null; last_sign_in_at?: string | null; invited_at?: string | null }): UserWithProfile => {
    const profile = profiles?.find((p: { user_id: string }) => p.user_id === user.id);
    return {
      id: user.id,
      email: user.email ?? "",
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
      invited_at: user.invited_at ?? null,
      profile: profile
        ? {
          role: profile.role ?? "user",
          display_name: profile.display_name,
        }
        : null,
    };
  });
}

// Minimal auth user shape returned by admin list/find operations
interface AuthUser {
  id: string;
  email?: string | null;
}

async function findUserByEmail(
  adminClient: SupabaseClient,
  email: string
): Promise<AuthUser | null> {
  const perPage = 1000;
  let page = 1;

  while (true) {
    // listUsers returns { data: { users } }
    const { data } = await adminClient.auth.admin.listUsers({ page, perPage });
    const users = data?.users ?? [];
    const found = users.find((u: { email?: string | null }) =>
      u.email?.toLowerCase() === email.toLowerCase()
    );
    if (found) return found;
    if (users.length < perPage) break;
    page += 1;
  }

  return null;
}

export async function updateUserRole(
  input: UpdateUserRoleInput
): Promise<DALResult> {
  await requireAdmin();

  const validated = UpdateUserRoleSchema.parse(input);
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(
    validated.userId,
    {
      app_metadata: { role: validated.role },
      user_metadata: { role: validated.role },
    }
  );

  if (authError) {
    console.error("[DAL] Failed to update auth metadata:", authError);
    return {
      success: false,
      error: `Failed to update user metadata: ${authError.message}`,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: validated.role,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", validated.userId);

  if (profileError) {
    console.error("[DAL] Failed to update profile:", profileError);
    return {
      success: false,
      error: `Failed to update profile: ${profileError.message}`,
    };
  }

  revalidatePath("/admin/users");

  console.log(`[DAL] Role updated: ${validated.userId} → ${validated.role}`);
  return { success: true };
}

export async function deleteUser(userId: string): Promise<DALResult> {
  await requireAdmin();

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !UUID_REGEX.test(userId)) {
    return {
      success: false,
      error: "UUID utilisateur invalide",
    };
  }

  const adminClient = await createAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("[DAL] Failed to delete user:", error);
    return {
      success: false,
      error: `Failed to delete user: ${error.message}`,
    };
  }

  revalidatePath("/admin/users");

  console.log(`[DAL] User deleted: ${userId}`);
  return { success: true };
}

async function getCurrentAdminIdFromClaims(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = (claimsData as { claims?: Record<string, unknown> } | undefined)?.claims;
  return claims?.sub ? String(claims.sub) : null;
}

async function checkInvitationRateLimit(
  supabase: SupabaseClient,
  currentAdminId: string | null
): Promise<void> {
  if (!currentAdminId) {
    return;
  }
  // 24 * 60 * 60 * 1000 ms = 1 jour
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("user_invitations")
    .select("*", { count: "exact", head: true })
    .eq("invited_by", currentAdminId)
    .gte("created_at", oneDayAgo);

  if (count && count >= 10) {
    throw new Error("[ERR_INVITE_001] Rate limit dépassé: maximum 10 invitations par jour");
  }
}

async function verifyUserDoesNotExist(
  adminClient: SupabaseClient,
  email: string
): Promise<void> {
  console.log(`[inviteUser] Checking for existing user: ${sanitizeEmailForLogs(email)}`);

  const existingUser = await findUserByEmail(adminClient, email);

  if (existingUser) {
    console.log(`[inviteUser] User ${email} already exists`);
    throw new Error(
      `[ERR_INVITE_002] Un utilisateur avec l'adresse ${email} existe déjà dans le système.`
    );
  }
}

// Generate an invite link first. generateLink(type: 'invite') will create the
// auth user and produce the invitation link. Creating the auth user first
// and then calling generateLink causes `email_exists` because generateLink
// expects to create the user for 'invite'.

async function generateUserInviteLinkWithUrl(
  adminClient: SupabaseClient,
  email: string,
  role: string,
  displayName: string
): Promise<{ invitationUrl: string }> {
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-account`;

  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "invite",
      email: email,
      options: {
        redirectTo: redirectUrl,
        data: {
          role: role,
          display_name: displayName,
        },
      },
    });

  if (linkError) {
    // do NOT delete the user automatically. Instead, surface diagnostic information
    console.error("[DAL] Failed to generate invite link:", linkError);
    console.log(`[DEBUG] linkError.code: ${linkError.code}, linkError.message: ${linkError.message}`);

    // Try to find an existing user record to provide more context to caller
    // const existing = await findUserByEmail(adminClient, validated.email);
    const existing = await findUserByEmail(adminClient, email);
    const existingId = existing?.id ?? null;

    if (
      linkError.code === "email_exists" ||
      linkError.message?.includes("email_exists") ||
      linkError.message?.includes("already been registered")
    ) {
      const errorMessage = existingId
        ? `Invitation impossible : un compte existe déjà (id=${existingId}). Vérifiez auth.users ou utilisez le flow de récupération.`
        : `Un utilisateur avec l'adresse ${email} existe déjà dans le système.`;

      throw new Error(`[ERR_INVITE_003] ${errorMessage}`);
    }

    throw new Error(
      `[ERR_INVITE_004] Erreur lors de la génération du lien d'invitation: ${linkError.message}`
    );
  }

  return { invitationUrl: linkData.properties.action_link };
}

async function waitForAuthUserCreation(
  adminClient: SupabaseClient,
  email: string
): Promise<string> {
  const maxAttempts = 5;
  const delayMs = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const found = await findUserByEmail(adminClient, email);
    if (found?.id) {
      return found.id;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.error("[DAL] Could not find auth user after generateLink.");
  throw new Error(
    `[ERR_INVITE_005] Invitation créée (lien), mais l'utilisateur n'a pas encore été visible dans auth.users. Veuillez vérifier manuellement.`
  );
}

async function createUserProfileWithRole(
  adminClient: SupabaseClient,
  userId: string,
  role: string,
  displayName: string
): Promise<void> {
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        role: role,
        display_name: displayName,
      },
      {
        onConflict: "user_id",
      }
    );

  if (profileError) {
    console.error("[DAL] Failed to upsert profile:", profileError);
    throw new Error(
      `[ERR_INVITE_006] Failed to upsert profile for user ${userId}: ${profileError.message}. L'utilisateur a été créé dans auth.users; veuillez vérifier manuellement si nécessaire.`
    );
  }

  console.log(`[DAL] Profile upserted (created or updated) for user ${userId}`);
}

async function rollbackProfileAndAuthUser(
  adminClient: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    await adminClient.from("profiles").delete().eq("user_id", userId);
    console.log(`[DAL] Profile rolled back for user ${userId}`);
  } catch (profileDeleteError) {
    console.error("[DAL] Failed to rollback profile:", profileDeleteError);
  }

  try {
    await adminClient.auth.admin.deleteUser(userId);
    console.log(`[DAL] Auth user rolled back: ${userId}`);
  } catch (userDeleteError) {
    console.error("[DAL] Failed to rollback auth user:", userDeleteError);
  }
}

async function sendInvitationEmailWithRollback(
  adminClient: SupabaseClient,
  email: string,
  role: string,
  displayName: string | undefined,
  invitationUrl: string,
  userId: string
): Promise<void> {
  try {
    const emailActions = await import("@/lib/email/actions");
    await emailActions.sendInvitationEmail({
      email: email,
      role: role,
      displayName: displayName,
      invitationUrl: invitationUrl,
    });
    console.log(`[DAL] Invitation email sent to ${email}`);
  } catch (error: unknown) {
    console.error(
      "[DAL] Failed to send invitation email, initiating complete rollback:",
      error
    );

    await rollbackProfileAndAuthUser(adminClient, userId);

    throw new Error(
      "[ERR_INVITE_007] Échec de l'envoi de l'email d'invitation. Rollback complet effectué."
    );
  }
}

async function logInvitationAuditRecord(
  supabase: SupabaseClient,
  currentAdminId: string | null,
  userId: string,
  email: string,
  role: string
): Promise<void> {
  if (!currentAdminId) {
    return;
  }

  await supabase.from("user_invitations").insert({
    user_id: userId,
    email: email,
    role: role,
    invited_by: currentAdminId,
  });
}

export async function inviteUser(
  input: InviteUserInput
): Promise<DALResult<{ userId: string }>> {
  await requireAdmin();

  const validated = InviteUserSchema.parse(input);
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const currentAdminId = await getCurrentAdminIdFromClaims(supabase);

  await checkInvitationRateLimit(supabase, currentAdminId);
  await verifyUserDoesNotExist(adminClient, validated.email);

  const displayName = validated.displayName || validated.email.split("@")[0];
  const { invitationUrl } = await generateUserInviteLinkWithUrl(
    adminClient,
    validated.email,
    validated.role,
    displayName
  );

  const userId = await waitForAuthUserCreation(adminClient, validated.email);
  await createUserProfileWithRole(adminClient, userId, validated.role, displayName);
  await sendInvitationEmailWithRollback(adminClient, validated.email, validated.role, validated.displayName, invitationUrl, userId);
  await logInvitationAuditRecord(supabase, currentAdminId, userId, validated.email, validated.role);

  revalidatePath("/admin/users");

  console.log(`[DAL] User invited successfully: userId=${userId} role=${validated.role}`);
  return { success: true, data: { userId } };
}

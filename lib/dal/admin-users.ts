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

export async function inviteUser(
  input: InviteUserInput
): Promise<DALResult<{ userId: string }>> {
  await requireAdmin();

  const validated = InviteUserSchema.parse(input);
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  // Use getClaims() for fast local JWT verification (performance ~2-5ms)
  // We only need the current user's id for rate-limiting, so avoid the slower getUser() network call
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = (claimsData as { claims?: Record<string, unknown> } | undefined)?.claims;
  const currentAdminId = claims?.sub ? String(claims.sub) : null;

  if (currentAdminId) {
    const { count } = await supabase
      .from("user_invitations")
      .select("*", { count: "exact", head: true })
      .eq("invited_by", currentAdminId)
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    if (count && count >= 10) {
      return {
        success: false,
        error: "Rate limit dépassé: maximum 10 invitations par jour",
      };
    }
  }

  console.log(`[inviteUser] Checking for existing user: ${validated.email}`);
  const existingUser = await findUserByEmail(adminClient, validated.email);

  if (existingUser) {
    console.log(`[inviteUser] User ${validated.email} already exists`);
    return {
      success: false,
      error: `Un utilisateur avec l'adresse ${validated.email} existe déjà dans le système.`,
    };
  }

  // Generate an invite link first. generateLink(type: 'invite') will create the
  // auth user and produce the invitation link. Creating the auth user first
  // and then calling generateLink causes `email_exists` because generateLink
  // expects to create the user for 'invite'.
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-account`;

  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "invite",
      email: validated.email,
      options: {
        redirectTo: redirectUrl,
        data: {
          role: validated.role,
          display_name:
            validated.displayName || validated.email.split("@")[0],
        },
      },
    });

  if (linkError) {
    // do NOT delete the user automatically. Instead, surface diagnostic information
    console.error("[DAL] Failed to generate invite link:", linkError);
    console.log(`[DEBUG] linkError.code: ${linkError.code}, linkError.message: ${linkError.message}`);

    // Try to find an existing user record to provide more context to caller
    const existing = await findUserByEmail(adminClient, validated.email);
    const existingId = existing?.id ?? null;

    if (
      linkError.code === "email_exists" ||
      linkError.message?.includes("email_exists") ||
      linkError.message?.includes("already been registered")
    ) {
      return {
        success: false,
        error: existingId
          ? `Invitation impossible : un compte existe déjà (id=${existingId}). Vérifiez auth.users ou utilisez le flow de récupération.`
          : `Un utilisateur avec l'adresse ${validated.email} existe déjà dans le système.`,
      };
    }

    return {
      success: false,
      error: `Erreur lors de la génération du lien d'invitation: ${linkError.message}`,
    };
  }

  const invitationUrl: string = linkData.properties.action_link;

  // After generateLink, locate the created auth user (may be async).
  let userId: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const found = await findUserByEmail(adminClient, validated.email);
    if (found?.id) {
      userId = found.id;
      break;
    }
    await new Promise((res) => setTimeout(res, 500));
  }

  if (!userId) {
    console.error('[DAL] Could not find auth user after generateLink.');
    return {
      success: false,
      error: `Invitation créée (lien), mais l'utilisateur n'a pas encore été visible dans auth.users. Veuillez vérifier manuellement.`,
    };
  }

  // Use adminClient to upsert profile (trigger may have already created it with default role)
  // We need to UPDATE it with the correct role and display_name
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        role: validated.role,
        display_name: validated.displayName || validated.email.split("@")[0],
      },
      {
        onConflict: "user_id",
      }
    );

  if (profileError) {
    console.error("[DAL] Failed to upsert profile:", profileError);
    // Do not delete the created auth user automatically. Return an informative error
    return {
      success: false,
      error: `Failed to upsert profile for user ${userId}: ${profileError.message}. L'utilisateur a été créé dans auth.users; veuillez vérifier manuellement si nécessaire.`,
    };
  }

  console.log(`[DAL] Profile upserted (created or updated) for user ${userId}`);

  try {
    const emailActions = await import("@/lib/email/actions");
    await emailActions.sendInvitationEmail({
      email: validated.email,
      role: validated.role,
      displayName: validated.displayName,
      invitationUrl: invitationUrl,
    });
    console.log(`[DAL] Invitation email sent to ${validated.email}`);
  } catch (error: unknown) {
    console.error("[DAL] Failed to send invitation email:", error);
    // Do not delete the created auth user automatically. Return a clear error for admin action.
    return {
      success: false,
      error: `Failed to send invitation email to ${validated.email}. L'utilisateur a été créé (id=${userId}) mais l'envoi a échoué. Vérifiez le service email ou contactez l'administrateur.`,
    };
  }

  if (currentAdminId) {
    await supabase.from("user_invitations").insert({
      user_id: userId,
      email: validated.email,
      role: validated.role,
      invited_by: currentAdminId,
    });
  }

  revalidatePath("/admin/users");

  console.log(
    `[DAL] User invited successfully: ${validated.email} (${validated.role})`
  );

  return {
    success: true,
    data: { userId },
  };
}

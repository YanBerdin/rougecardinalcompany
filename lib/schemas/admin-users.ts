import { z } from "zod";

// =============================================================================
// BLOCKED EMAIL DOMAINS
// =============================================================================

const BLOCKED_EMAIL_DOMAINS = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwaway.email",
] as const;

const COMMON_EMAIL_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
};

// =============================================================================
// UPDATE USER ROLE SCHEMA
// =============================================================================

export const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid({ message: "UUID utilisateur invalide" }),
  role: z.enum(["user", "editor", "admin"], {
    message: "Rôle invalide",
  }),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

// =============================================================================
// INVITE USER SCHEMA
// =============================================================================

export const InviteUserSchema = z.object({
  email: z
    .string()
    .email({ message: "Email invalide" })
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        return !BLOCKED_EMAIL_DOMAINS.includes(
          domain as (typeof BLOCKED_EMAIL_DOMAINS)[number]
        );
      },
      {
        message: "Domaine email non autorisé (domaines jetables interdits)",
      }
    )
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        const suggestion = COMMON_EMAIL_TYPOS[domain];
        if (suggestion) {
          throw new Error(
            `Vérifiez l'orthographe du domaine email (vouliez-vous dire ${suggestion} ?)`
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

export type InviteUserInput = z.infer<typeof InviteUserSchema>;

// =============================================================================
// USER ROLE ENUM
// =============================================================================

export const UserRoleEnum = z.enum(["user", "editor", "admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

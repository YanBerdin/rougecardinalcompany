/**
 * @file Auth schemas
 * @description Zod schemas partagés pour la validation des credentials.
 * @module lib/schemas/auth
 *
 * Aligné OWASP ASVS v4 L2 :
 *  - longueur minimale 12 caractères
 *  - 4 classes de caractères obligatoires (minuscule, majuscule, chiffre, symbole)
 *
 * NB : la politique côté Supabase (Dashboard → Auth → Policies → Password) DOIT
 * être configurée à l'identique pour bloquer aussi les écritures via Admin SDK
 * et les flows OAuth/Magic Link.
 */

import { z } from "zod";

const MIN_PASSWORD_LENGTH = 12;

const PASSWORD_RULES = [
    { regex: /[a-z]/, message: "Doit contenir au moins une minuscule." },
    { regex: /[A-Z]/, message: "Doit contenir au moins une majuscule." },
    { regex: /\d/, message: "Doit contenir au moins un chiffre." },
    {
        regex: /[^A-Za-z0-9]/,
        message: "Doit contenir au moins un caractère spécial.",
    },
] as const;

/**
 * Schéma de validation d'un mot de passe utilisateur.
 *
 * Usage côté UI (react-hook-form) et côté Server Actions (validation defense-in-depth).
 */
export const PasswordSchema = z
    .string()
    .min(
        MIN_PASSWORD_LENGTH,
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    )
    .superRefine((value, ctx) => {
        for (const rule of PASSWORD_RULES) {
            if (!rule.regex.test(value)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: rule.message,
                });
            }
        }
    });

export type Password = z.infer<typeof PasswordSchema>;

/**
 * Schéma de création / changement de mot de passe avec confirmation.
 *
 * Utilisé par :
 *  - SetupAccountForm (flow d'invitation admin)
 *  - SignUpForm (inscription publique si activée)
 *  - UpdatePasswordForm (reset password)
 */
export const PasswordWithConfirmationSchema = z
    .object({
        password: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas.",
        path: ["confirmPassword"],
    });

export type PasswordWithConfirmation = z.infer<
    typeof PasswordWithConfirmationSchema
>;

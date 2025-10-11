"use server";

import { createClient } from "@/supabase/server";
import { createBrowserClient } from "@supabase/ssr";
import { SITE_CONFIG } from "@/lib/site-config";
/*
import type {
  AuthError,
  SignUpWithPasswordCredentials,
  SignInWithPasswordCredentials
} from '@supabase/supabase-js';
*/

// ========================================
// SERVER-SIDE AUTH ACTIONS
// ========================================

/**
 * Inscription avec email/password
 */
export async function signUpAction(
  email: string,
  password: string,
  metadata?: Record<string, any> //TODO: fix Unexpected any
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: SITE_CONFIG.AUTH.EMAIL_REDIRECT_TO,
      data: metadata, // Métadonnées utilisateur optionnelles
    },
  });

  if (error) {
    console.error("[Auth] Sign up error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] User signed up:", data.user?.email);
  return { success: true, user: data.user };
}

/**
 * Connexion avec email/password
 */
export async function signInAction(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[Auth] Sign in error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] User signed in:", data.user.email);
  return { success: true, user: data.user };
}

/**
 * Déconnexion
 */
export async function signOutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Auth] Sign out error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] User signed out");
  return { success: true };
}

/**
 * Demande de réinitialisation mot de passe
 */
export async function resetPasswordAction(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_CONFIG.SERVER.DEV_URL}/auth/reset-password`,
  });

  if (error) {
    console.error("[Auth] Password reset error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] Password reset email sent to:", email);
  return { success: true };
}

/**
 * Mise à jour du mot de passe (après reset)
 */
export async function updatePasswordAction(newPassword: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("[Auth] Password update error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] Password updated for user:", data.user?.email);
  return { success: true };
}

/**
 * Connexion avec Magic Link
 */
export async function signInWithMagicLinkAction(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: SITE_CONFIG.AUTH.EMAIL_REDIRECT_TO,
    },
  });

  if (error) {
    console.error("[Auth] Magic link error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] Magic link sent to:", email);
  return { success: true };
}

/**
 * Renvoyer l'email de vérification
 */
export async function resendVerificationEmailAction() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Non authentifié" };
  }

  if (user.email_confirmed_at) {
    return { success: false, error: "Email déjà vérifié" };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email!,
    options: {
      emailRedirectTo: SITE_CONFIG.AUTH.EMAIL_REDIRECT_TO,
    },
  });

  if (error) {
    console.error("[Auth] Resend verification error:", error);
    return { success: false, error: error.message };
  }

  console.log("[Auth] Verification email resent to:", user.email);
  return { success: true };
}

// ========================================
// CLIENT-SIDE AUTH CLASS
// ========================================

/**
 * Classe Auth pour utilisation côté client
 * Usage: const auth = new AuthService()
 */
export class AuthService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) {
    //TODO: fix Unexpected any
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: SITE_CONFIG.AUTH.EMAIL_REDIRECT_TO,
        data: metadata,
      },
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({ password: newPassword });
  }

  async signInWithMagicLink(email: string) {
    return await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async getUser() {
    return await this.supabase.auth.getUser();
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }
}

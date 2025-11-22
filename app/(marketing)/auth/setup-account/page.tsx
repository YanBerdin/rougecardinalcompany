"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { SetupAccountForm } from "@/components/auth/SetupAccountForm";
import type { User } from "@supabase/supabase-js";

export default function SetupAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInvitation = async () => {
      const supabase = createClient();

      // Check if we have tokens in the URL hash (from Supabase redirect)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log("🔍 Processing invitation tokens from URL hash...");

        // Extract tokens from hash
        const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenType = params.get('type');

        if (accessToken && refreshToken && tokenType === 'invite') {
          console.log("✅ Found invitation tokens, setting session...");

          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("❌ Failed to set session:", error);
            setError("Erreur lors de l'établissement de la session");
            setIsLoading(false);
            return;
          }

          console.log("✅ Session established successfully");
          setUser(data.user);

          // Clean up the URL (remove hash)
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          console.log("❌ Invalid or missing tokens in hash");
          setError("Lien d'invitation invalide");
        }
      } else {
        // Check if user is already authenticated
        console.log("🔍 Checking existing authentication...");
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.log("❌ No authentication found");
          setError("Veuillez utiliser le lien d'invitation reçu par email");
        } else {
          console.log("✅ User already authenticated:", user.email);
          setUser(user);
        }
      }

      setIsLoading(false);
    };

    handleInvitation();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Configuration de votre compte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Activer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bienvenue {user.email} !
            Définissez votre mot de passe pour accéder à votre compte.
          </p>
        </div>

        <SetupAccountForm email={user.email || ""} userRole="user" />
      </div>
    </div>
  );
}
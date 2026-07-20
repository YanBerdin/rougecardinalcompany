"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { SetupAccountForm } from "@/components/auth/SetupAccountForm";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

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

            // Supabase redirects with an error hash when the OTP invite token is
            // invalid, already consumed, or expired
            // (e.g. #error=access_denied&error_code=otp_expired). Detect it first
            // so we can show an actionable message instead of the generic one.
            if (hash && hash.includes('error')) {
                const errorParams = new URLSearchParams(hash.substring(1));
                const errorCode = errorParams.get('error_code');

                if (errorCode === 'otp_expired') {
                    setError(
                        "Votre lien d'invitation a expiré ou a déjà été utilisé. " +
                        "Veuillez demander une nouvelle invitation à un administrateur."
                    );
                } else {
                    setError(
                        "Ce lien d'invitation n'est plus valide. " +
                        "Veuillez demander une nouvelle invitation à un administrateur."
                    );
                }
                setIsLoading(false);
                return;
            }

            if (hash && hash.includes('access_token')) {
                // Extract tokens from hash
                const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const tokenType = params.get('type');

                if (accessToken && refreshToken && tokenType === 'invite') {
                    // Set the session with the tokens
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        console.error("Failed to set invitation session:", error);
                        setError("Erreur lors de l'établissement de la session");
                        setIsLoading(false);
                        return;
                    }

                    setUser(data.user);

                    // Clean up the URL (remove hash)
                    window.history.replaceState(null, '', window.location.pathname);
                } else {
                    setError("Lien d'invitation invalide");
                }
            } else {
                // Check if user is already authenticated
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    setError("Veuillez utiliser le lien d'invitation reçu par email");
                } else {
                    setUser(user);
                }
            }

            setIsLoading(false);
        };

        handleInvitation();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Configuration de votre compte...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="max-w-md w-full text-center mx-8">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                        <p className="text-md text-destructive font-semibold">{error}</p>
                    </div>
                    <Button
                        variant="default"
                        onClick={() => router.push("/")}
                        className="mt-4"
                    >
                        Retour à l&apos;accueil
                    </Button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground">Redirection en cours...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl md:text-4xl font-extrabold text-foreground">
                        Activer votre compte
                    </h2>
                    <p className="mt-2 text-center text-base text-gold-text">
                        Bienvenue {user.email} !
                        Définissez votre mot de passe pour accéder à votre compte.
                    </p>
                </div>

                <SetupAccountForm email={user.email || ""} />
            </div>
        </div>
    );
}
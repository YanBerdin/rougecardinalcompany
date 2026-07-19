"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// This is a Client Component ("use client"). Importing @/lib/env (t3-env) or
// @/lib/site-config (which imports @/lib/env and reads server-only vars like
// EMAIL_FROM) pulls server-side env validation into the client bundle and
// throws "Attempted to access a server-side environment variable on the
// client" at runtime. Same documented exception as supabase/client.ts:
// NEXT_PUBLIC_* vars are embedded at build time, so read them via process.env
// directly, and use window.location.origin as the site URL (this code only
// runs client-side, after the `typeof window` guard).
const SITE_TITLE = "Rouge Cardinal";

interface ParsedInvitation {
    error: string | null;
    targetUrl: string | null;
}

/**
 * Validates that the decoded URL is a genuine Supabase invite verification
 * link pointing back to this site, preventing this page from being abused
 * as an open redirect.
 */
function isSafeInvitationUrl(rawUrl: string): boolean {
    try {
        const target = new URL(rawUrl);
        const supabaseHost = new URL(
            process.env.NEXT_PUBLIC_SUPABASE_URL!
        ).host;

        if (target.protocol !== "https:" || target.host !== supabaseHost) {
            return false;
        }
        if (!target.pathname.startsWith("/auth/v1/verify")) {
            return false;
        }

        const redirectTo = target.searchParams.get("redirect_to");
        return Boolean(
            redirectTo && redirectTo.startsWith(window.location.origin)
        );
    } catch {
        return false;
    }
}

/**
 * Reads and validates the invitation URL from the current location.
 * Runs once (lazy useState initializer) — no effect, no cascading renders.
 */
function parseInvitationFromLocation(): ParsedInvitation {
    if (typeof window === "undefined") {
        return { error: null, targetUrl: null };
    }

    const encoded = new URLSearchParams(window.location.search).get("url");
    if (!encoded) {
        return { error: "Lien d'invitation invalide ou incomplet.", targetUrl: null };
    }

    let decoded: string;
    try {
        decoded = decodeURIComponent(encoded);
    } catch {
        return { error: "Lien d'invitation invalide.", targetUrl: null };
    }

    if (!isSafeInvitationUrl(decoded)) {
        return { error: "Lien d'invitation invalide ou non reconnu.", targetUrl: null };
    }

    return { error: null, targetUrl: decoded };
}

export default function AcceptInvitationPage() {
    const router = useRouter();
    // Lazy initializer runs once on first client render — avoids the
    // setState-in-effect cascading-render warning.
    const [{ error, targetUrl }] = useState<ParsedInvitation>(
        parseInvitationFromLocation
    );

    const handleActivate = () => {
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                        <p className="text-destructive">{error}</p>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="text-primary hover:text-primary/80 transition-colors"
                    >
                        Retour à l&apos;accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                    Activer votre compte
                </h1>
                <p className="text-muted-foreground">
                    Vous avez été invité(e) à rejoindre {SITE_TITLE}. Pour
                    protéger votre lien d&apos;invitation contre une utilisation
                    automatique par les filtres de sécurité de votre messagerie,
                    veuillez cliquer sur le bouton ci-dessous pour continuer.
                </p>
                <button
                    type="button"
                    onClick={handleActivate}
                    disabled={!targetUrl}
                    className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    Continuer vers l&apos;activation
                </button>
            </div>
        </div>
    );
}

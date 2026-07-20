"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// This is a Client Component ("use client"). Importing @/lib/env (t3-env) or
// @/lib/site-config (which imports @/lib/env and reads server-only vars like
// EMAIL_FROM) pulls server-side env validation into the client bundle and
// throws "Attempted to access a server-side environment variable on the
// client" at runtime. Same documented exception as supabase/client.ts:
// NEXT_PUBLIC_* vars are embedded at build time, so read them via process.env
// directly, and use window.location.origin as the site URL (this code only
// runs client-side, after the `typeof window` guard).
const SITE_TITLE = "Rouge Cardinal";

// Hardcoded production origin (not imported from lib/site-config to avoid
// pulling server-only env validation into this Client Component's bundle,
// see comment above). Used as a fallback alongside window.location.origin so
// that the redirect_to check does not depend on incidental host variations
// (e.g. www vs apex domain, or a proxy rewriting the Host header).
const PRODUCTION_ORIGIN = "https://compagnie-rouge-cardinal.fr";

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
            redirectTo &&
            (redirectTo.startsWith(window.location.origin) ||
                redirectTo.startsWith(PRODUCTION_ORIGIN))
        );
    } catch {
        return false;
    }
}

/**
 * Reads and validates the invitation URL from the current location.
 * Must run client-side only: it reads `window.location`. It is invoked from a
 * `useEffect` (after mount) rather than a lazy `useState` initializer, because
 * the lazy initializer would execute during SSR (where `window` is undefined,
 * yielding `targetUrl: null`) and React would then reuse that server-computed
 * value on hydration WITHOUT re-running it — leaving the activation button
 * permanently disabled.
 *
 * Note: `URLSearchParams.get()` already percent-decodes the value once, so
 * `decodeURIComponent` must NOT be called again here — the invitation link
 * is only percent-encoded a single time (see `encodeURIComponent` in
 * `lib/email/actions.ts::sendInvitationEmail`). A redundant second decode
 * previously risked throwing on legitimate tokens and was removed.
 */
function parseInvitationFromLocation(): ParsedInvitation {
    const decoded = new URLSearchParams(window.location.search).get("url");
    if (!decoded) {
        return { error: "Lien d'invitation invalide ou incomplet.", targetUrl: null };
    }

    if (!isSafeInvitationUrl(decoded)) {
        return { error: "Lien d'invitation invalide ou non reconnu.", targetUrl: null };
    }

    return { error: null, targetUrl: decoded };
}

export default function AcceptInvitationPage() {
    const router = useRouter();
    // Parsing happens in an effect (client-only) rather than a lazy useState
    // initializer to avoid the SSR-computed null state sticking after
    // hydration and keeping the button disabled forever.
    const [{ error, targetUrl }, setInvitation] = useState<ParsedInvitation>({
        error: null,
        targetUrl: null,
    });

    useEffect(() => {
        // Reading window.location is a browser-only side effect that must run
        // once after mount; setting state here is the intended pattern for
        // syncing a client-only value into React after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvitation(parseInvitationFromLocation());
    }, []);

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
                    <Button
                        onClick={() => router.push("/")}
                        className="text-primary hover:text-primary/80 transition-colors"
                    >
                        Retour à l&apos;accueil
                    </Button>
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
                <p className="text-base text-gold-text">
                    Vous avez été invité(e) à rejoindre {SITE_TITLE}. Pour
                    protéger votre lien d&apos;invitation contre une utilisation
                    automatique par les filtres de sécurité de votre messagerie,
                    veuillez cliquer sur le bouton ci-dessous pour continuer.
                </p>
                <Button
                    onClick={handleActivate}
                    disabled={!targetUrl}
                    className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-chart-2 transition-colors disabled:opacity-50"
                >
                    Continuer vers l&apos;activation
                </Button>
            </div>
        </div>
    );
}

"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "rc_cookie_notice_seen";
const DISMISS_EVENT = "rc-cookie-dismiss";

function subscribe(callback: () => void) {
    window.addEventListener(DISMISS_EVENT, callback);
    return () => window.removeEventListener(DISMISS_EVENT, callback);
}

function getClientSnapshot() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return true;
    }
}

function getServerSnapshot() {
    return true; // Pas de rendu SSR — évite la discordance d'hydratation
}

export function CookieBanner() {
    const isSeen = useSyncExternalStore(
        subscribe,
        getClientSnapshot,
        getServerSnapshot,
    );

    function handleDismiss() {
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // Ignorer si localStorage inaccessible
        }
        window.dispatchEvent(new Event(DISMISS_EVENT));
    }

    if (isSeen) return null;

    return (
        <div
            role="dialog"
            aria-label="Information sur les cookies"
            aria-live="polite"
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/60 px-4 py-4 backdrop-blur-lg shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:px-6"
        >
            <div className="container mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-foreground/90 leading-relaxed">
                    Ce site utilise une mesure d&apos;audience interne anonymisée (IP tronquée,
                    aucun traceur tiers).{" "}
                    <Link
                        href="/cookies"
                        className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-foreground/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        En savoir plus
                    </Link>
                </p>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    Compris
                </button>
            </div>
        </div>
    );
}

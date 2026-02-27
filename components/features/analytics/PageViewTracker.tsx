"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/app/actions/analytics.actions";

const SESSION_STORAGE_KEY = "rc_session_id";

/**
 * Generate or retrieve an anonymous session ID (UUID v4) from sessionStorage.
 * The session ID persists for the duration of the browser tab.
 */
function getOrCreateSessionId(): string {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
}

/**
 * PageViewTracker — fires a page_view event on every navigation.
 *
 * Silently fails on error to never disrupt the user experience.
 * Place once in the marketing layout.
 */
export function PageViewTracker() {
    const pathname = usePathname();
    const lastTrackedPathname = useRef<string | null>(null);

    useEffect(() => {
        // Avoid duplicate tracking for the same pathname (StrictMode double-invoke)
        if (lastTrackedPathname.current === pathname) return;
        lastTrackedPathname.current = pathname;

        const sessionId = getOrCreateSessionId();
        const userAgent = navigator.userAgent;

        trackPageView({ pathname, sessionId, userAgent }).catch(() => {
            // silent failure — never break navigation
        });
    }, [pathname]);

    return null;
}

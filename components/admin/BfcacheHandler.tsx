"use client";

import { useEffect } from "react";

/**
 * Handles browser back-forward cache (bfcache) to prevent React hydration mismatch.
 * 
 * When a user navigates back from a 404 page, the browser may restore the page
 * from bfcache with stale React IDs, causing hydration errors.
 * 
 * This component forces a page reload when restored from bfcache.
 */
export function BfcacheHandler() {
    useEffect(() => {
        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                window.location.reload();
            }
        }

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    return null;
}

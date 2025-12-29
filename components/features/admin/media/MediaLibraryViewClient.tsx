/**
 * @file MediaLibraryViewClient (Client Component Wrapper)
 * @description Dynamic import wrapper to prevent SSR hydration mismatch with Radix Select
 */
"use client";

import dynamic from "next/dynamic";

// Disable SSR to avoid hydration mismatch with Radix Select IDs
export const MediaLibraryViewClient = dynamic(
    () => import("./MediaLibraryView").then(mod => ({ default: mod.MediaLibraryView })),
    { 
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Chargement...</div>
            </div>
        )
    }
);

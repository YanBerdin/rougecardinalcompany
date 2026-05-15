"use client";

import { AlertCircle, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PressReleaseAutoSaveStatus } from "@/lib/hooks/use-press-release-autosave";

interface AutoSaveIndicatorProps {
    status: PressReleaseAutoSaveStatus;
    lastSavedAt: Date | null;
    errorMessage?: string | null;
    className?: string;
}

function formatSavedTime(date: Date | null): string {
    if (!date) return "";

    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function AutoSaveIndicator({
    status,
    lastSavedAt,
    errorMessage,
    className,
}: AutoSaveIndicatorProps) {
    const savedTime = formatSavedTime(lastSavedAt);

    if (status === "saving") {
        return (
            <div
                role="status"
                aria-live="polite"
                className={cn(
                    "flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800",
                    className
                )}
            >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Enregistrement automatique en cours...</span>
            </div>
        );
    }

    if (status === "saved") {
        return (
            <div
                role="status"
                aria-live="polite"
                className={cn(
                    "flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800",
                    className
                )}
            >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>{savedTime ? `Enregistré à ${savedTime}` : "Brouillon enregistré"}</span>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div
                role="status"
                aria-live="polite"
                className={cn(
                    "flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800",
                    className
                )}
            >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{errorMessage ?? "Erreur de sauvegarde automatique"}</span>
            </div>
        );
    }

    if (status === "dirty") {
        return (
            <div
                role="status"
                aria-live="polite"
                className={cn(
                    "flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800",
                    className
                )}
            >
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                <span>Modifications en attente de sauvegarde...</span>
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700",
                className
            )}
        >
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span>Auto-save inactif tant qu&apos;aucun brouillon n&apos;est saisi</span>
        </div>
    );
}

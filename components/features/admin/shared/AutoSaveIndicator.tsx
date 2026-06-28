"use client";

import { AlertCircle, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormAutoSaveStatus } from "@/lib/hooks/use-form-autosave";

export interface AutoSaveIndicatorProps {
    status: FormAutoSaveStatus;
    lastSavedAt: Date | null;
    errorMessage?: string | null;
    className?: string;
}

function formatSavedTime(date: Date | null): string | null {
    if (!date) return null;
    try {
        return new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return null;
    }
}

export function AutoSaveIndicator({
    status,
    lastSavedAt,
    errorMessage,
    className,
}: AutoSaveIndicatorProps) {
    const baseClass = cn(
        "flex items-center gap-2 text-sm font-medium",
        className
    );

    if (status === "saving") {
        return (
            <div
                className={cn(baseClass, "text-blue-600 dark:text-blue-400")}
                role="status"
                aria-live="polite"
            >
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Enregistrement automatique en cours...</span>
            </div>
        );
    }

    if (status === "saved") {
        const formatted = formatSavedTime(lastSavedAt);
        return (
            <div
                className={cn(baseClass, "text-emerald-600 dark:text-emerald-400")}
                role="status"
                aria-live="polite"
            >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                <span>
                    {formatted ? `Enregistré à ${formatted}` : "Brouillon enregistré"}
                </span>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div
                className={cn(baseClass, "text-red-600 dark:text-red-400")}
                role="status"
                aria-live="polite"
            >
                <AlertCircle className="size-4" aria-hidden="true" />
                <span>{errorMessage ?? "Erreur de sauvegarde automatique"}</span>
            </div>
        );
    }

    if (status === "dirty") {
        return (
            <div
                className={cn(baseClass, "text-amber-600 dark:text-amber-400")}
                role="status"
                aria-live="polite"
            >
                <Clock3 className="size-4" aria-hidden="true" />
                <span>Modifications en attente de sauvegarde...</span>
            </div>
        );
    }

    return (
        <div
            className={cn(baseClass, "text-slate-500 dark:text-slate-400")}
            role="status"
            aria-live="polite"
        >
            <Clock3 className="size-4" aria-hidden="true" />
            <span>Auto-save inactif tant qu&apos;aucun brouillon n&apos;est saisi</span>
        </div>
    );
}

"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    count: number;
    usedMediaCount: number;
    uniqueLocations: string[];
    isPending: boolean;
    onConfirm: () => void;
}

export function BulkDeleteDialog({
    open,
    onOpenChange,
    count,
    usedMediaCount,
    uniqueLocations,
    isPending,
    onConfirm,
}: BulkDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg bg-card">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold">
                        Confirmer la suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p className="text-base">
                                Êtes-vous sûr de vouloir supprimer définitivement <br />
                                <strong>{count} média{count > 1 ? "s" : ""}</strong> ?
                            </p>

                            {usedMediaCount > 0 && (
                                <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3">
                                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Attention
                                    </p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                        <strong>{usedMediaCount}</strong> média{usedMediaCount > 1 ? "s sont utilisés" : " est utilisé"} sur le site public.
                                    </p>
                                    {uniqueLocations.length > 0 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            Emplacements : {uniqueLocations.join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}

                            <p className="text-sm md:text-md">
                                <span className="text-destructive font-medium">Cette action est irréversible.</span>
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isPending}
                        className="h-11 px-6 text-base"
                    >
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="h-11 px-6 text-base bg-destructive text-destructive-foreground hover:bg-red-500/20 hover:text-destructive"
                        aria-label={`Confirmer la suppression de ${count} média${count > 1 ? "s" : ""}`}
                    >
                        {isPending ? "Suppression..." : "Supprimer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

"use client";

import { useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaDetailActionsProps {
    media: MediaItemExtendedDTO;
    onDelete: () => Promise<void>;
    onRegenerate: () => Promise<void>;
    isDeleting: boolean;
    isUpdating: boolean;
    isRegenerating: boolean;
}

export function MediaDetailActions({
    media,
    onDelete,
    onRegenerate,
    isDeleting,
    isUpdating,
    isRegenerating,
}: MediaDetailActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDeleteConfirm = async () => {
        await onDelete();
        setShowDeleteDialog(false);
    };

    const isImage = media.mime?.startsWith("image/");
    const needsThumbnail = !media.thumbnail_path;

    return (
        <>
            {isImage && needsThumbnail && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={onRegenerate}
                    disabled={isUpdating || isDeleting || isRegenerating}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                    {isRegenerating ? "Génération..." : "Générer thumbnail"}
                </Button>
            )}

            <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isUpdating || isDeleting}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le média
            </Button>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold">
                            Confirmer la suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p className="text-base">
                                    Êtes-vous sûr de vouloir supprimer définitivement ce média ?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Fichier : <strong>{media.filename ?? media.storage_path}</strong>
                                </p>
                                <p className="text-sm">
                                    <span className="text-destructive font-medium">
                                        Cette action est irréversible.
                                    </span>
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="h-11 px-6 text-base">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="h-11 px-6 text-base bg-destructive text-destructive-foreground hover:bg-red-500/20 hover:text-destructive"
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

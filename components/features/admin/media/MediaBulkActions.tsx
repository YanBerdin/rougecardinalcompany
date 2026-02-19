"use client";

import { useState } from "react";
import { Trash2, FolderOpen, Tag, X, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import {
    bulkDeleteMediaAction,
    bulkMoveMediaAction,
    bulkTagMediaAction,
    bulkUntagMediaAction
} from "@/lib/actions/media-bulk-actions";
import type { MediaFolderDTO, MediaTagDTO, MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaBulkActionsProps {
    selectedMedia: MediaItemExtendedDTO[]; // Changed from selectedIds to full media objects
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClearSelection: () => void;
    onSuccess: () => void;
}

export function MediaBulkActions({
    selectedMedia,
    folders,
    tags,
    onClearSelection,
    onSuccess,
}: MediaBulkActionsProps) {
    const [isPending, setIsPending] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string>("");
    const [selectedTagsToAdd, setSelectedTagsToAdd] = useState<number[]>([]);
    const [selectedTagsToRemove, setSelectedTagsToRemove] = useState<number[]>([]);

    const count = selectedMedia.length;
    const selectedIds = selectedMedia.map(m => m.id);

    // Phase 4.3: Check if any selected media is used on public pages
    const usedMediaCount = selectedMedia.filter(m => m.is_used_public).length;
    const usedMediaLocations = selectedMedia
        .filter(m => m.is_used_public && m.usage_locations)
        .flatMap(m => m.usage_locations ?? []);
    const uniqueLocations = Array.from(new Set(usedMediaLocations));

    // Get unique source folders
    const sourceFolders = Array.from(
        new Set(
            selectedMedia
                .map(m => m.folder?.name ?? "Uploads génériques")
        )
    );

    // Get tags that exist on at least one of the selected media
    const existingTagIds = Array.from(
        new Set(
            selectedMedia
                .flatMap(m => m.tags.map(t => t.id))
        )
    );

    // Filter tags to only show existing ones in "Remove" section
    const removableTags = tags.filter(tag => existingTagIds.includes(tag.id));

    // Get tags present on ALL selected media
    const tagsOnAllMedia = tags.filter(tag =>
        selectedMedia.every(m => m.tags.some(t => t.id === tag.id))
    );

    // Filter tags to only show non-existing ones in "Add" section
    const addableTags = tags.filter(tag =>
        !tagsOnAllMedia.some(t => t.id === tag.id)
    );

    if (count === 0) {
        return null;
    }

    const handleBulkDelete = async () => {
        setIsPending(true);
        try {
            const result = await bulkDeleteMediaAction(selectedIds);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(`${count} média${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}`);
            onSuccess();
            onClearSelection();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur suppression");
        } finally {
            setIsPending(false);
            setShowDeleteDialog(false);
        }
    };

    const handleBulkMove = async () => {
        if (!selectedFolder) {
            toast.error("Sélectionnez un dossier");
            return;
        }

        setIsPending(true);
        try {
            const folderId = selectedFolder === "root" ? null : Number(selectedFolder);
            const result = await bulkMoveMediaAction(selectedIds, folderId);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(`${count} média${count > 1 ? "s" : ""} déplacé${count > 1 ? "s" : ""}`);
            setSelectedFolder("");
            onSuccess();
            onClearSelection();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur déplacement");
        } finally {
            setIsPending(false);
        }
    };

    const handleBulkTag = async () => {
        if (selectedTagsToAdd.length === 0) {
            toast.error("Sélectionnez au moins un tag à ajouter");
            return;
        }

        setIsPending(true);
        try {
            const result = await bulkTagMediaAction(selectedIds, selectedTagsToAdd);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(`Tags ajoutés à ${count} média${count > 1 ? "s" : ""}`);
            setSelectedTagsToAdd([]);
            onSuccess();
            onClearSelection();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur ajout tags");
        } finally {
            setIsPending(false);
        }
    };

    const handleBulkUntag = async () => {
        if (selectedTagsToRemove.length === 0) {
            toast.error("Sélectionnez au moins un tag à retirer");
            return;
        }

        setIsPending(true);
        try {
            const result = await bulkUntagMediaAction(selectedIds, selectedTagsToRemove);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(`Tags retirés de ${count} média${count > 1 ? "s" : ""}`);
            setSelectedTagsToRemove([]);
            onSuccess();
            onClearSelection();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur retrait tags");
        } finally {
            setIsPending(false);
        }
    };

    const toggleTagToAdd = (tagId: number) => {
        setSelectedTagsToAdd((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    const toggleTagToRemove = (tagId: number) => {
        setSelectedTagsToRemove((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <>
            <div
                className="fixed bottom-0 md:bottom-60 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto z-40 bg-card/95 backdrop-blur-md border-t md:border md:rounded-xl shadow-2xl p-3 md:p-6 md:min-w-[700px] md:max-w-[90vw] transition-all duration-200 max-h-[85vh] overflow-y-auto"
                role="toolbar"
                aria-label="Actions de sélection multiple"
            >
                <div className="flex flex-col gap-3">
                    {/* Rangée 1 : sélection + déplacer + supprimer */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {/* Badge sélectionné + annuler */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge
                                variant="secondary"
                                className="text-sm font-semibold px-3 py-1.5"
                                aria-live="polite"
                            >
                                {count} sélectionné{count > 1 ? "s" : ""}
                            </Badge>
                            <Button
                                variant="outline-destructive"
                                size="icon"
                                title="Annuler la sélection"
                                onClick={onClearSelection}
                                className="h-9 w-9 text-foreground hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 shrink-0"
                                aria-label="Annuler la sélection"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Annuler la sélection</span>
                            </Button>
                        </div>

                        {/* Source folders info */}
                        {sourceFolders.length > 0 && (
                            <div className="sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                <Folder className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="truncate max-w-[120px]" title={sourceFolders.join(", ")}>
                                    {sourceFolders.length === 1
                                        ? sourceFolders[0]
                                        : `${sourceFolders.length} dossiers`
                                    }
                                </span>
                            </div>
                        )}

                        <div className="hidden md:block w-px h-7 bg-border shrink-0" aria-hidden="true" />

                        {/* Déplacer vers un dossier */}
                        <div className="flex items-center gap-2 shrink min-w-0">
                            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                                <SelectTrigger
                                    className="md:w-h-40 lg:w-48 h-9 text-sm bg-muted/50 border focus:ring-2 focus:ring-primary"
                                    aria-label="Sélectionner un dossier de destination"
                                >
                                    <SelectValue placeholder="Déplacer vers..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">Uploads génériques</SelectItem>
                                    {folders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id.toString()}>
                                            {folder.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                variant="default"
                                title="Déplacer"
                                onClick={handleBulkMove}
                                disabled={!selectedFolder || isPending}
                                className="h-9 px-3 text-sm font-medium whitespace-nowrap shrink-0"
                                aria-label={`Déplacer ${count} média${count > 1 ? 's' : ''} vers le dossier sélectionné`}
                            >
                                <FolderOpen className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Déplacer</span>
                            </Button>
                        </div>

                        {/* Supprimer */}
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isPending}
                            className="h-9 px-3 text-sm font-medium whitespace-nowrap shrink-0 ml-auto"
                            aria-label={`Supprimer ${count} média${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}
                            title={`Supprimer ${count} média${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}
                        >
                            <Trash2 className="h-4 w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Supprimer</span>
                        </Button>
                    </div>

                    {/* Rangée 2 : tags (toujours sur sa propre ligne) */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 border-t pt-2">
                        {/* Add & Remove tags */}
                        <div className="flex flex-col gap-2 w-full">
                            {/* Add tags section */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Ajouter:</span>
                                <div
                                    className="flex flex-wrap gap-1.5 flex-1 min-w-0"
                                    role="group"
                                    aria-label="Sélection de tags à ajouter"
                                >
                                    {addableTags.slice(0, 3).map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="cursor-pointer px-2.5 py-1 text-xs font-medium transition-all hover:scale-95 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary border-foreground/20"
                                            onClick={async () => {
                                                setIsPending(true);
                                                try {
                                                    const result = await bulkTagMediaAction(selectedIds, [tag.id]);
                                                    if (!result.success) throw new Error(result.error);
                                                    toast.success(`Tag '${tag.name}' ajouté à ${count} média${count > 1 ? "s" : ""}`);
                                                    onSuccess();
                                                    onClearSelection();
                                                } catch (error) {
                                                    toast.error(error instanceof Error ? error.message : "Erreur ajout tag");
                                                } finally {
                                                    setIsPending(false);
                                                }
                                            }}
                                            onKeyDown={async (e) => {
                                                if (e.key === ' ' || e.key === 'Enter') {
                                                    e.preventDefault();
                                                    setIsPending(true);
                                                    try {
                                                        const result = await bulkTagMediaAction(selectedIds, [tag.id]);
                                                        if (!result.success) throw new Error(result.error);
                                                        toast.success(`Tag '${tag.name}' ajouté à ${count} média${count > 1 ? "s" : ""}`);
                                                        onSuccess();
                                                        onClearSelection();
                                                    } catch (error) {
                                                        toast.error(error instanceof Error ? error.message : "Erreur ajout tag");
                                                    } finally {
                                                        setIsPending(false);
                                                    }
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`Ajouter tag ${tag.name}`}
                                            aria-disabled={isPending}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Remove tags section */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Retirer:</span>
                                {removableTags.length > 0 ? (
                                    <div
                                        className="flex flex-wrap gap-1.5 flex-1 min-w-0"
                                        role="group"
                                        aria-label="Sélection de tags à retirer"
                                    >
                                        {removableTags.slice(0, 3).map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="destructive"
                                                className="cursor-pointer px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 hover:bg-card-foreground focus:outline-none focus:ring-2 focus:ring-destructive border-foreground/20"
                                                onClick={async () => {
                                                    setIsPending(true);
                                                    try {
                                                        const result = await bulkUntagMediaAction(selectedIds, [tag.id]);
                                                        if (!result.success) throw new Error(result.error);
                                                        toast.success(`Tag '${tag.name}' retiré de ${count} média${count > 1 ? "s" : ""}`);
                                                        onSuccess();
                                                        onClearSelection();
                                                    } catch (error) {
                                                        toast.error(error instanceof Error ? error.message : "Erreur retrait tag");
                                                    } finally {
                                                        setIsPending(false);
                                                    }
                                                }}
                                                onKeyDown={async (e) => {
                                                    if (e.key === ' ' || e.key === 'Enter') {
                                                        e.preventDefault();
                                                        setIsPending(true);
                                                        try {
                                                            const result = await bulkUntagMediaAction(selectedIds, [tag.id]);
                                                            if (!result.success) throw new Error(result.error);
                                                            toast.success(`Tag '${tag.name}' retiré de ${count} média${count > 1 ? "s" : ""}`);
                                                            onSuccess();
                                                            onClearSelection();
                                                        } catch (error) {
                                                            toast.error(error instanceof Error ? error.message : "Erreur retrait tag");
                                                        } finally {
                                                            setIsPending(false);
                                                        }
                                                    }
                                                }}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={`Retirer tag ${tag.name}`}
                                                aria-disabled={isPending}
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                        Aucun tag sur les médias sélectionnés
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="max-w-lg bg-card">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold">
                            Confirmer la suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p className="text-base">
                                    Êtes-vous sûr de vouloir supprimer définitivement <br /><strong>{count} média{count > 1 ? "s" : ""}</strong> ?
                                </p>

                                {/* Phase 4.3: Warning for used media */}
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
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="h-11 px-6 text-base bg-destructive text-destructive-foreground hover:bg-red-500/20 hover:text-destructive"
                            aria-label={`Confirmer la suppression de ${count} média${count > 1 ? 's' : ''}`}
                        >
                            {isPending ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

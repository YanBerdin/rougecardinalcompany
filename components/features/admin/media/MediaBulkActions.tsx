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
                className="fixed bottom-0 md:bottom-6 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto z-40 bg-card/95 backdrop-blur-md border-t md:border md:rounded-xl shadow-2xl p-4 md:p-6 md:min-w-[700px] md:max-w-[90vw] transition-all duration-200"
                role="toolbar"
                aria-label="Actions de sélection multiple"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    {/* Selected count */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between md:justify-start gap-3">
                            <Badge
                                variant="default"
                                className="text-sm md:text-base font-semibold px-3 md:px-4 py-1.5 md:py-2 bg-primary text-primary-foreground"
                                aria-live="polite"
                            >
                                {count} sélectionné{count > 1 ? "s" : ""}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClearSelection}
                                className="h-9 w-9 md:h-10 md:w-10 text-foreground hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label="Annuler la sélection"
                            >
                                <X className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="sr-only">Annuler la sélection</span>
                            </Button>
                        </div>

                        {/* Source folders info */}
                        {sourceFolders.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Folder className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate" title={sourceFolders.join(", ")}>
                                    {sourceFolders.length === 1
                                        ? sourceFolders[0]
                                        : `${sourceFolders.length} dossiers différents`
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                        {/* Move to folder */}
                        <div className="flex items-center gap-2">
                            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                                <SelectTrigger
                                    className="flex-1 md:w-40 lg:w-48 h-10 md:h-11 text-sm md:text-base bg-muted/50 border focus:ring-2 focus:ring-primary"
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
                                size="default"
                                variant="secondary"
                                onClick={handleBulkMove}
                                disabled={!selectedFolder || isPending}
                                className="h-10 md:h-11 px-3 md:px-4 text-sm md:text-base font-medium whitespace-nowrap"
                                aria-label={`Déplacer ${count} média${count > 1 ? 's' : ''} vers le dossier sélectionné`}
                            >
                                <FolderOpen className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                                <span className="hidden sm:inline">Déplacer</span>
                            </Button>
                        </div>

                        {/* Add & Remove tags */}
                        <div className="hidden lg:flex flex-col gap-2">
                            {/* Add tags section */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Ajouter:</span>
                                <div
                                    className="flex flex-wrap gap-1.5 max-w-xs"
                                    role="group"
                                    aria-label="Sélection de tags à ajouter"
                                >
                                    {addableTags.slice(0, 3).map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={selectedTagsToAdd.includes(tag.id) ? "default" : "outline"}
                                            className="cursor-pointer px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary border-foreground/20"
                                            onClick={() => toggleTagToAdd(tag.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === ' ' || e.key === 'Enter') {
                                                    e.preventDefault();
                                                    toggleTagToAdd(tag.id);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="checkbox"
                                            aria-checked={selectedTagsToAdd.includes(tag.id)}
                                            aria-label={`Ajouter tag ${tag.name}`}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                                <Button
                                    size="default"
                                    variant="secondary"
                                    onClick={handleBulkTag}
                                    disabled={selectedTagsToAdd.length === 0 || isPending}
                                    className="h-9 px-3 text-xs font-medium whitespace-nowrap"
                                    aria-label={`Ajouter ${selectedTagsToAdd.length} tag${selectedTagsToAdd.length > 1 ? 's' : ''} à ${count} média${count > 1 ? 's' : ''}`}
                                >
                                    <Tag className="mr-1.5 h-3.5 w-3.5" />
                                    +
                                </Button>
                            </div>

                            {/* Remove tags section */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Retirer:</span>
                                {removableTags.length > 0 ? (
                                    <>
                                        <div
                                            className="flex flex-wrap gap-1.5 max-w-xs"
                                            role="group"
                                            aria-label="Sélection de tags à retirer"
                                        >
                                            {removableTags.slice(0, 3).map((tag) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant={selectedTagsToRemove.includes(tag.id) ? "destructive" : "outline"}
                                                    className="cursor-pointer px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-destructive border-foreground/20"
                                                    onClick={() => toggleTagToRemove(tag.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === ' ' || e.key === 'Enter') {
                                                            e.preventDefault();
                                                            toggleTagToRemove(tag.id);
                                                        }
                                                    }}
                                                    tabIndex={0}
                                                    role="checkbox"
                                                    aria-checked={selectedTagsToRemove.includes(tag.id)}
                                                    aria-label={`Retirer tag ${tag.name}`}
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Button
                                            size="default"
                                            variant="destructive"
                                            onClick={handleBulkUntag}
                                            disabled={selectedTagsToRemove.length === 0 || isPending}
                                            className="h-9 px-3 text-xs font-medium whitespace-nowrap"
                                            aria-label={`Retirer ${selectedTagsToRemove.length} tag${selectedTagsToRemove.length > 1 ? 's' : ''} de ${count} média${count > 1 ? 's' : ''}`}
                                        >
                                            <X className="mr-1.5 h-3.5 w-3.5" />
                                            -
                                        </Button>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                        Aucun tag sur les médias sélectionnés
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Delete */}
                        <Button
                            size="default"
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isPending}
                            className="h-10 md:h-11 px-3 md:px-4 text-sm md:text-base font-medium whitespace-nowrap"
                            aria-label={`Supprimer ${count} média${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}
                        >
                            <Trash2 className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                            <span className="hidden sm:inline">Supprimer</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold">
                            Confirmer la suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p className="text-base">
                                    Êtes-vous sûr de vouloir supprimer définitivement <strong>{count} média{count > 1 ? "s" : ""}</strong> ?
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
                                
                                <p className="text-sm">
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
                            className="h-11 px-6 text-base bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

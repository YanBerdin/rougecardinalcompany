"use client";

import { useState } from "react";
import { Trash2, FolderOpen, X, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { MediaFolderDTO, MediaTagDTO, MediaItemExtendedDTO } from "@/lib/schemas/media";
import { toast } from "sonner";
import {
    bulkDeleteMediaAction,
    bulkMoveMediaAction,
    bulkTagMediaAction,
    bulkUntagMediaAction
} from "@/lib/actions/media-bulk-actions";
import { BulkTagSelector } from "./BulkTagSelector";
import { BulkDeleteDialog } from "./BulkDeleteDialog";

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

    type BulkActionResult = { success: boolean; error?: string };
    const executeBulkAction = async (
        action: () => Promise<BulkActionResult>,
        successMessage: string,
        errorMessage: string,
        onCleanup?: () => void,
    ) => {
        setIsPending(true);
        try {
            const result = await action();
            if (!result.success) throw new Error(result.error);
            toast.success(successMessage);
            onCleanup?.();
            onSuccess();
            onClearSelection();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : errorMessage);
        } finally {
            setIsPending(false);
        }
    };

    const handleBulkDelete = async () => {
        await executeBulkAction(
            () => bulkDeleteMediaAction(selectedIds),
            `${count} média${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}`,
            "Erreur suppression",
        );
        setShowDeleteDialog(false);
    };

    const handleBulkMove = async () => {
        if (!selectedFolder) {
            toast.error("Sélectionnez un dossier");
            return;
        }
        const folderId = selectedFolder === "root" ? null : Number(selectedFolder);
        await executeBulkAction(
            () => bulkMoveMediaAction(selectedIds, folderId),
            `${count} média${count > 1 ? "s" : ""} déplacé${count > 1 ? "s" : ""}`,
            "Erreur déplacement",
            () => setSelectedFolder(""),
        );
    };

    const handleAddTagQuick = async (tagId: number) => {
        const tag = tags.find(t => t.id === tagId);
        await executeBulkAction(
            () => bulkTagMediaAction(selectedIds, [tagId]),
            `Tag '${tag?.name}' ajouté à ${count} média${count > 1 ? "s" : ""}`,
            "Erreur ajout tag",
        );
    };

    const handleRemoveTagQuick = async (tagId: number) => {
        const tag = tags.find(t => t.id === tagId);
        await executeBulkAction(
            () => bulkUntagMediaAction(selectedIds, [tagId]),
            `Tag '${tag?.name}' retiré de ${count} média${count > 1 ? "s" : ""}`,
            "Erreur retrait tag",
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

                    {/* Rangée 2 : tags */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 border-t pt-2">
                        <BulkTagSelector
                            addableTags={addableTags}
                            removableTags={removableTags}
                            isPending={isPending}
                            onAddTag={handleAddTagQuick}
                            onRemoveTag={handleRemoveTagQuick}
                        />
                    </div>
                </div>
            </div>

            <BulkDeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                count={count}
                usedMediaCount={usedMediaCount}
                uniqueLocations={uniqueLocations}
                isPending={isPending}
                onConfirm={handleBulkDelete}
            />
        </>
    );
}

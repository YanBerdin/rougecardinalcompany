"use client";

import { useState } from "react";
import { Trash2, FolderOpen, Tag, X } from "lucide-react";
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
    bulkTagMediaAction
} from "@/lib/actions/media-bulk-actions";
import type { MediaFolderDTO, MediaTagDTO } from "@/lib/schemas/media";

interface MediaBulkActionsProps {
    selectedIds: number[];
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClearSelection: () => void;
    onSuccess: () => void;
}

export function MediaBulkActions({
    selectedIds,
    folders,
    tags,
    onClearSelection,
    onSuccess,
}: MediaBulkActionsProps) {
    const [isPending, setIsPending] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    const count = selectedIds.length;

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
        if (selectedTags.length === 0) {
            toast.error("Sélectionnez au moins un tag");
            return;
        }

        setIsPending(true);
        try {
            const result = await bulkTagMediaAction(selectedIds, selectedTags);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(`Tags ajoutés à ${count} média${count > 1 ? "s" : ""}`);
            setSelectedTags([]);
            onSuccess();
            onClearSelection();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur ajout tags");
        } finally {
            setIsPending(false);
        }
    };

    const toggleTag = (tagId: number) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 min-w-[600px]">
                <div className="flex items-center justify-between gap-4">
                    {/* Selected count */}
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                            {count} sélectionné{count > 1 ? "s" : ""}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClearSelection}
                            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Move to folder */}
                        <div className="flex items-center gap-2">
                            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                                <SelectTrigger className="w-40 h-9 bg-primary-foreground/10 border-0">
                                    <SelectValue placeholder="Déplacer vers..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">Racine</SelectItem>
                                    {folders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id.toString()}>
                                            {folder.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleBulkMove}
                                disabled={!selectedFolder || isPending}
                            >
                                <FolderOpen className="mr-2 h-4 w-4" />
                                Déplacer
                            </Button>
                        </div>

                        {/* Add tags */}
                        <div className="flex items-center gap-2">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                                {tags.slice(0, 5).map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleTag(tag.id)}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleBulkTag}
                                disabled={selectedTags.length === 0 || isPending}
                            >
                                <Tag className="mr-2 h-4 w-4" />
                                Tagger
                            </Button>
                        </div>

                        {/* Delete */}
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Supprimer définitivement {count} média{count > 1 ? "s" : ""} ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

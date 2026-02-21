"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Trash2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { updateMediaMetadataAction, deleteMediaImage, regenerateThumbnailAction } from "@/lib/actions/media-actions";
import { MediaItemExtendedDTOSchema, type MediaItemExtendedDTO, type MediaFolderDTO, type MediaTagDTO } from "@/lib/schemas/media";
import { getMediaPublicUrl } from "@/lib/dal/media";
import { cn } from "@/lib/utils";

interface MediaDetailsPanelProps {
    media: MediaItemExtendedDTO | null;
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClose: () => void;
    onUpdate: () => void;
}

const MetadataFormSchema = MediaItemExtendedDTOSchema.pick({
    alt_text: true,
    folder_id: true,
}).partial();

type MetadataFormValues = {
    alt_text?: string | null;
    folder_id?: number | null;
};

export function MediaDetailsPanel({
    media,
    folders,
    tags,
    onClose,
    onUpdate,
}: MediaDetailsPanelProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [selectedTagsToAdd, setSelectedTagsToAdd] = useState<number[]>([]);
    const [selectedTagsToRemove, setSelectedTagsToRemove] = useState<number[]>([]);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);

    const form = useForm<MetadataFormValues>({
        resolver: zodResolver(MetadataFormSchema),
        defaultValues: {
            alt_text: media?.alt_text ?? "",
            folder_id: media?.folder_id ?? undefined,
        },
    });

    // Tags déjà attribués au média
    const assignedTags = media?.tags ?? [];
    const assignedTagIds = assignedTags.map(t => t.id);

    // Tags disponibles (non encore attribués)
    const availableTags = tags.filter(tag => !assignedTagIds.includes(tag.id));

    useEffect(() => {
        if (media) {
            form.reset({
                alt_text: media.alt_text ?? "",
                folder_id: media.folder_id ?? undefined,
            });
            setSelectedTagsToAdd([]);
            setSelectedTagsToRemove([]);

            const resolveUrl = async () => {
                const url = await getMediaPublicUrl(media.storage_path);
                setPublicUrl(url);
            };
            resolveUrl();
        } else {
            setPublicUrl(null);
        }
    }, [media, form]);

    if (!media) {
        return null;
    }

    const handleUpdate = async (data: MetadataFormValues) => {
        setIsUpdating(true);
        try {
            // Calculer les nouveaux tag_ids : (assignés - à retirer) + à ajouter
            const currentTagIds = new Set(assignedTagIds);

            // Retirer les tags sélectionnés pour suppression
            selectedTagsToRemove.forEach(id => currentTagIds.delete(id));

            // Ajouter les tags sélectionnés pour ajout
            selectedTagsToAdd.forEach(id => currentTagIds.add(id));

            const finalTagIds = Array.from(currentTagIds);

            const result = await updateMediaMetadataAction(media.id, {
                alt_text: data.alt_text,
                folder_id: data.folder_id,
                tag_ids: finalTagIds,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Métadonnées mises à jour");
            setSelectedTagsToAdd([]);
            setSelectedTagsToRemove([]);
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur mise à jour");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteMediaImage(media.id);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Média supprimé");
            setShowDeleteDialog(false);
            onClose();
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRegenerateThumbnail = async () => {
        if (!media) return;
        
        setIsRegenerating(true);
        try {
            const result = await regenerateThumbnailAction(String(media.id));

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Thumbnail régénéré avec succès");
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur génération thumbnail");
        } finally {
            setIsRegenerating(false);
        }
    };

    const toggleTag = (tagId: number) => {
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

    const fileSize = media.size_bytes
        ? `${(media.size_bytes / 1024 / 1024).toFixed(2)} MB`
        : "N/A";

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] border-l bg-background shadow-lg">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Détails du média</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {/* Preview */}
                        <div className="aspect-video rounded-md overflow-hidden bg-muted relative">
                            {publicUrl ? (
                                <Image
                                    src={publicUrl}
                                    alt={media.alt_text ?? media.filename ?? "Media preview"}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p className="text-sm">Chargement de l&apos;aperçu...</p>
                                </div>
                            )}
                        </div>

                        {/* File Info */}
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-medium">Nom du fichier</p>
                                <p className="text-sm text-muted-foreground break-all">
                                    {media.filename}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <p className="text-sm text-muted-foreground">{media.mime}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Taille</p>
                                    <p className="text-sm text-muted-foreground">{fileSize}</p>
                                </div>
                            </div>

                            {/* Phase 4.3: Public usage indicator */}
                            {media.is_used_public && (
                                <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3">
                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                                        <Eye className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                        <span className="text-sm">Utilisé sur le site public</span>
                                    </div>
                                    {media.usage_locations && media.usage_locations.length > 0 && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                                            Emplacements : {media.usage_locations.join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Edit Form */}
                        <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="alt_text">Texte alternatif</Label>
                                <Input
                                    id="alt_text"
                                    placeholder="Description pour accessibilité"
                                    {...form.register("alt_text")}
                                />
                            </div>

                            {/* Folder */}
                            <div className="space-y-2">
                                <Label htmlFor="folder">Dossier</Label>
                                <Select
                                    value={form.watch("folder_id")?.toString() ?? "none"}
                                    onValueChange={(value) =>
                                        form.setValue("folder_id", value === "none" ? null : Number(value))
                                    }
                                >
                                    <SelectTrigger id="folder">
                                        <SelectValue placeholder="Uploads génériques" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Uploads génériques</SelectItem>
                                        {folders.map((folder) => (
                                            <SelectItem key={folder.id} value={folder.id.toString()}>
                                                {folder.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags */}
                            <div className="space-y-3">
                                <Label>Tags</Label>

                                {/* Tags déjà attribués */}
                                {assignedTags.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Tags attribués (cliquez pour retirer) :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {assignedTags.map((tag) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant={selectedTagsToRemove.includes(tag.id) ? "destructive" : "default"}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:scale-105",
                                                        selectedTagsToRemove.includes(tag.id) && "opacity-50"
                                                    )}
                                                    onClick={() => toggleTagToRemove(tag.id)}
                                                >
                                                    {tag.name}
                                                    {selectedTagsToRemove.includes(tag.id) && " ✕"}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tags disponibles à ajouter */}
                                {availableTags.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Tags disponibles (cliquez pour ajouter) :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableTags.map((tag) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant={selectedTagsToAdd.includes(tag.id) ? "default" : "outline"}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:scale-95",
                                                        selectedTagsToAdd.includes(tag.id) && "ring-2 ring-primary"
                                                    )}
                                                    onClick={() => toggleTag(tag.id)}
                                                >
                                                    {selectedTagsToAdd.includes(tag.id) && "✓ "}
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {assignedTags.length === 0 && availableTags.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">Aucun tag disponible</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isUpdating || isDeleting}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isUpdating ? "Mise à jour..." : "Enregistrer"}
                            </Button>
                        </form>

                        <Separator />

                        {/* Regenerate Thumbnail (only for images without thumbnail) */}
                        {media.mime?.startsWith("image/") && !media.thumbnail_path && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleRegenerateThumbnail}
                                disabled={isUpdating || isDeleting || isRegenerating}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                                {isRegenerating ? "Génération..." : "Générer thumbnail"}
                            </Button>
                        )}

                        {/* Delete */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isUpdating || isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer le média
                        </Button>
                    </div>
                </ScrollArea>
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
                                    Êtes-vous sûr de vouloir supprimer définitivement ce média ?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Fichier : <strong>{media.filename ?? media.storage_path}</strong>
                                </p>
                                <p className="text-sm">
                                    <span className="text-destructive font-medium">Cette action est irréversible.</span>
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="h-11 px-6 text-base"
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-11 px-6 text-base bg-destructive text-destructive-foreground hover:bg-red-500/20 hover:text-destructive"
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

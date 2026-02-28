"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { updateMediaMetadataAction, deleteMediaImage, regenerateThumbnailAction } from "@/lib/actions/media-actions";
import { MediaItemExtendedDTOSchema, type MediaItemExtendedDTO, type MediaFolderDTO, type MediaTagDTO } from "@/lib/schemas/media";
import { getMediaPublicUrl } from "@/lib/dal/media";
import { MediaPreview } from "./details/MediaPreview";
import { MediaFileInfo } from "./details/MediaFileInfo";
import { MediaEditForm, type MetadataFormValues } from "./details/MediaEditForm";
import { MediaDetailActions } from "./details/MediaDetailActions";

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

export function MediaDetailsPanel({
    media,
    folders,
    tags,
    onClose,
    onUpdate,
}: MediaDetailsPanelProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);

    const form = useForm<MetadataFormValues>({
        resolver: zodResolver(MetadataFormSchema),
        defaultValues: {
            alt_text: media?.alt_text ?? "",
            folder_id: media?.folder_id ?? undefined,
        },
    });

    useEffect(() => {
        if (media) {
            form.reset({
                alt_text: media.alt_text ?? "",
                folder_id: media.folder_id ?? undefined,
            });

            const resolveUrl = async () => {
                const url = await getMediaPublicUrl(media.storage_path);
                setPublicUrl(url);
            };
            resolveUrl();
        } else {
            setPublicUrl(null);
        }
    }, [media, form]);

    if (!media) return null;

    const handleUpdate = async (
        data: MetadataFormValues,
        tagsToAdd: number[],
        tagsToRemove: number[],
    ) => {
        setIsUpdating(true);
        try {
            const currentTagIds = new Set((media.tags ?? []).map(t => t.id));
            tagsToRemove.forEach(id => currentTagIds.delete(id));
            tagsToAdd.forEach(id => currentTagIds.add(id));

            const result = await updateMediaMetadataAction(media.id, {
                alt_text: data.alt_text,
                folder_id: data.folder_id,
                tag_ids: Array.from(currentTagIds),
            });

            if (!result.success) throw new Error(result.error);

            toast.success("Métadonnées mises à jour");
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

            if (!result.success) throw new Error(result.error);

            toast.success("Média supprimé");
            onClose();
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRegenerateThumbnail = async () => {
        setIsRegenerating(true);
        try {
            const result = await regenerateThumbnailAction(String(media.id));

            if (!result.success) throw new Error(result.error);

            toast.success("Thumbnail régénéré avec succès");
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur génération thumbnail");
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] border-l bg-background shadow-lg">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Détails du média</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        <MediaPreview media={media} publicUrl={publicUrl} />
                        <MediaFileInfo media={media} />
                        <Separator />
                        <MediaEditForm
                            form={form}
                            folders={folders}
                            tags={tags}
                            media={media}
                            onSubmit={handleUpdate}
                            isUpdating={isUpdating}
                            isDeleting={isDeleting}
                        />
                        <Separator />
                        <MediaDetailActions
                            media={media}
                            onDelete={handleDelete}
                            onRegenerate={handleRegenerateThumbnail}
                            isDeleting={isDeleting}
                            isUpdating={isUpdating}
                            isRegenerating={isRegenerating}
                        />
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

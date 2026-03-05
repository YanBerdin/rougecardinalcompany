"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    updateMediaMetadataAction,
    deleteMediaImage,
    regenerateThumbnailAction,
} from "@/lib/actions/media-actions";
import {
    MediaItemExtendedDTOSchema,
    type MediaItemExtendedDTO,
    type MediaFolderDTO,
    type MediaTagDTO,
} from "@/lib/schemas/media";
import { getMediaPublicUrl } from "@/lib/dal/media";
import { MediaDetailsContext, type MediaDetailsContextValue } from "./MediaDetailsContext";
import type { MetadataFormValues } from "./details/MediaEditForm";

const MetadataFormSchema = MediaItemExtendedDTOSchema.pick({
    alt_text: true,
    folder_id: true,
}).partial();

interface MediaDetailsProviderProps {
    media: MediaItemExtendedDTO;
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClose: () => void;
    onUpdate: () => void;
    children: React.ReactNode;
}

export function MediaDetailsProvider({
    media,
    folders,
    tags,
    onClose,
    onUpdate,
    children,
}: MediaDetailsProviderProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);

    const form = useForm<MetadataFormValues>({
        resolver: zodResolver(MetadataFormSchema),
        defaultValues: {
            alt_text: media.alt_text ?? "",
            folder_id: media.folder_id ?? undefined,
        },
    });

    useEffect(() => {
        form.reset({
            alt_text: media.alt_text ?? "",
            folder_id: media.folder_id ?? undefined,
        });

        const resolveUrl = async () => {
            const url = await getMediaPublicUrl(media.storage_path);
            setPublicUrl(url);
        };
        resolveUrl();
    }, [media, form]);

    const handleUpdate = useCallback(async (
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
    }, [media, onUpdate]);

    const handleDelete = useCallback(async () => {
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
    }, [media.id, onClose, onUpdate]);

    const handleRegenerateThumbnail = useCallback(async () => {
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
    }, [media.id, onUpdate]);

    const contextValue = useMemo<MediaDetailsContextValue>(() => ({
        state: { isUpdating, isDeleting, isRegenerating, publicUrl, form },
        actions: { handleUpdate, handleDelete, handleRegenerateThumbnail, onClose },
        meta: { media, folders, tags },
    }), [
        isUpdating, isDeleting, isRegenerating, publicUrl, form,
        handleUpdate, handleDelete, handleRegenerateThumbnail, onClose,
        media, folders, tags,
    ]);

    return (
        <MediaDetailsContext value={contextValue}>
            {children}
        </MediaDetailsContext>
    );
}

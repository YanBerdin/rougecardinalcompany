"use client";

import { createContext, use } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { MediaItemExtendedDTO, MediaFolderDTO, MediaTagDTO } from "@/lib/schemas/media";
import type { MetadataFormValues } from "./details/MediaEditForm";

type MediaDetailsState = {
    isUpdating: boolean;
    isDeleting: boolean;
    isRegenerating: boolean;
    publicUrl: string | null;
    form: UseFormReturn<MetadataFormValues>;
};

type MediaDetailsActions = {
    handleUpdate: (data: MetadataFormValues, tagsToAdd: number[], tagsToRemove: number[]) => Promise<void>;
    handleDelete: () => Promise<void>;
    handleRegenerateThumbnail: () => Promise<void>;
    onClose: () => void;
};

type MediaDetailsMeta = {
    media: MediaItemExtendedDTO;
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
};

export type MediaDetailsContextValue = {
    state: MediaDetailsState;
    actions: MediaDetailsActions;
    meta: MediaDetailsMeta;
};

export const MediaDetailsContext = createContext<MediaDetailsContextValue | null>(null);

export function useMediaDetailsContext(): MediaDetailsContextValue {
    const ctx = use(MediaDetailsContext);
    if (!ctx) throw new Error("useMediaDetailsContext must be used within a MediaDetailsProvider");
    return ctx;
}

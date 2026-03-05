/**
 * @file MediaLibraryContext
 * @description Context and hook for shared MediaLibrary state via dependency injection.
 * Pattern: AgendaContext — state/actions/meta separation with React 19 `use()` hook.
 */
"use client";

import { createContext, use } from "react";
import type { MediaItemExtendedDTO, MediaTagDTO, MediaFolderDTO } from "@/lib/schemas/media";
import type { MediaSelectResult } from "./types";

export interface MediaLibraryState {
    media: MediaItemExtendedDTO[];
    searchQuery: string;
    selectedFolder: string;
    selectedTag: string;
    selectedMedia: MediaItemExtendedDTO | null;
    selectedIds: number[];
    selectionMode: boolean;
    isUploadOpen: boolean;
    uploadFolder: string;
    filteredMedia: MediaItemExtendedDTO[];
}

export interface MediaLibraryActions {
    setSearchQuery: (query: string) => void;
    setSelectedFolder: (folder: string) => void;
    setSelectedTag: (tag: string) => void;
    setSelectedMedia: (media: MediaItemExtendedDTO | null) => void;
    setIsUploadOpen: (open: boolean) => void;
    setUploadFolder: (folder: string) => void;
    handleUploadSuccess: (result: MediaSelectResult) => void;
    handleCardClick: (item: MediaItemExtendedDTO) => void;
    toggleSelectionMode: () => void;
    clearSelection: () => void;
    handleBulkSuccess: () => void;
    handleDetailUpdate: () => void;
    getUploadFolderDefault: () => string;
}

export interface MediaLibraryMeta {
    availableTags: MediaTagDTO[];
    availableFolders: MediaFolderDTO[];
}

export interface MediaLibraryContextValue {
    state: MediaLibraryState;
    actions: MediaLibraryActions;
    meta: MediaLibraryMeta;
}

export const MediaLibraryContext = createContext<MediaLibraryContextValue | null>(null);

export function useMediaLibraryContext(): MediaLibraryContextValue {
    const ctx = use(MediaLibraryContext);
    if (!ctx) {
        throw new Error(
            "useMediaLibraryContext must be used within a MediaLibraryProvider"
        );
    }
    return ctx;
}

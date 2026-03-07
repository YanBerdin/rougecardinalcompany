/**
 * @file MediaLibraryProvider
 * @description Client provider that owns all MediaLibrary state and actions.
 * Logic migrated from useMediaLibraryState.ts (hook deleted after this migration).
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    MediaLibraryContext,
    type MediaLibraryContextValue,
} from "./MediaLibraryContext";
import type { MediaItemExtendedDTO, MediaTagDTO, MediaFolderDTO } from "@/lib/schemas/media";
import type { MediaSelectResult } from "./types";

interface MediaLibraryProviderProps {
    initialMedia: MediaItemExtendedDTO[];
    availableTags: MediaTagDTO[];
    availableFolders: MediaFolderDTO[];
    children: React.ReactNode;
}

export function MediaLibraryProvider({
    initialMedia,
    availableTags,
    availableFolders,
    children,
}: MediaLibraryProviderProps) {
    const router = useRouter();
    const [media, setMedia] = useState(initialMedia);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [selectedTag, setSelectedTag] = useState<string>("all");
    const [selectedMedia, setSelectedMedia] = useState<MediaItemExtendedDTO | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFolder, setUploadFolder] = useState<string>("uploads");

    // Sync local state when props change (after router.refresh())
    useEffect(() => {
        setMedia(initialMedia);
    }, [initialMedia]);

    const filteredMedia = useMemo(() => {
        return media.filter((item) => {
            const matchesSearch =
                !searchQuery ||
                item.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFolder =
                selectedFolder === "all" ||
                (selectedFolder === "root" && item.folder_id === null) ||
                item.folder_id === Number(selectedFolder);

            const matchesTag =
                selectedTag === "all" ||
                item.tags.some((tag) => tag.id === Number(selectedTag));

            return matchesSearch && matchesFolder && matchesTag;
        });
    }, [media, searchQuery, selectedFolder, selectedTag]);

    const handleUploadSuccess = useCallback(
        (result: MediaSelectResult) => {
            if (result.error) {
                toast.error("Erreur d'upload", { description: result.error });
                return;
            }
            toast.success("Image uploadée avec succès");
            router.refresh();
        },
        [router]
    );

    const toggleSelection = useCallback((mediaId: number) => {
        setSelectedIds((prev) =>
            prev.includes(mediaId)
                ? prev.filter((id) => id !== mediaId)
                : [...prev, mediaId]
        );
    }, []);

    const handleCardClick = useCallback(
        (item: MediaItemExtendedDTO) => {
            if (selectionMode) {
                toggleSelection(item.id);
            } else {
                setSelectedMedia(item);
            }
        },
        [selectionMode, toggleSelection]
    );

    const toggleSelectionMode = useCallback(() => {
        setSelectionMode((prev) => !prev);
        setSelectedIds([]);
    }, []);

    const clearSelection = useCallback(() => setSelectedIds([]), []);

    const handleBulkSuccess = useCallback(() => {
        router.refresh();
        setSelectedIds([]);
    }, [router]);

    const handleDetailUpdate = useCallback(() => {
        router.refresh();
        setSelectedMedia(null);
    }, [router]);

    const getUploadFolderDefault = useCallback(() => {
        return availableFolders[0]?.slug ?? "uploads";
    }, [availableFolders]);

    const contextValue = useMemo<MediaLibraryContextValue>(
        () => ({
            state: {
                media,
                searchQuery,
                selectedFolder,
                selectedTag,
                selectedMedia,
                selectedIds,
                selectionMode,
                isUploadOpen,
                uploadFolder,
                filteredMedia,
            },
            actions: {
                setSearchQuery,
                setSelectedFolder,
                setSelectedTag,
                setSelectedMedia,
                setIsUploadOpen,
                setUploadFolder,
                handleUploadSuccess,
                handleCardClick,
                toggleSelectionMode,
                clearSelection,
                handleBulkSuccess,
                handleDetailUpdate,
                getUploadFolderDefault,
            },
            meta: {
                availableTags,
                availableFolders,
            },
        }),
        [
            media,
            searchQuery,
            selectedFolder,
            selectedTag,
            selectedMedia,
            selectedIds,
            selectionMode,
            isUploadOpen,
            uploadFolder,
            filteredMedia,
            handleUploadSuccess,
            handleCardClick,
            toggleSelectionMode,
            clearSelection,
            handleBulkSuccess,
            handleDetailUpdate,
            getUploadFolderDefault,
            availableTags,
            availableFolders,
        ]
    );

    return (
        <MediaLibraryContext value={contextValue}>
            {children}
        </MediaLibraryContext>
    );
}

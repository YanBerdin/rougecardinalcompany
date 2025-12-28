/**
 * @file MediaLibraryView (Client Component)
 * @description Interactive media library with filters, upload, and grid display
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Search, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MediaDetailsPanel } from "./MediaDetailsPanel";
import { MediaBulkActions } from "./MediaBulkActions";
import type { MediaItemExtendedDTO, MediaTagDTO, MediaFolderDTO } from "@/lib/schemas/media";
import { cn } from "@/lib/utils";

interface MediaLibraryViewProps {
    initialMedia: MediaItemExtendedDTO[];
    availableTags: MediaTagDTO[];
    availableFolders: MediaFolderDTO[];
}

export function MediaLibraryView({
    initialMedia,
    availableTags,
    availableFolders,
}: MediaLibraryViewProps) {
    const router = useRouter();
    const [media, setMedia] = useState(initialMedia);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolder, setSelectedFolder] = useState<string>("all");
    const [selectedTag, setSelectedTag] = useState<string>("all");
    const [selectedMedia, setSelectedMedia] = useState<MediaItemExtendedDTO | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    // Sync state when props change (after router.refresh())
    useEffect(() => {
        setMedia(initialMedia);
    }, [initialMedia]);

    // Filter media based on search and filters
    const filteredMedia = useMemo(() => {
        return media.filter((item) => {
            // Search filter
            const matchesSearch =
                !searchQuery ||
                item.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase());

            // Folder filter
            const matchesFolder =
                selectedFolder === "all" ||
                (selectedFolder === "root" && item.folder_id === null) ||
                item.folder_id === Number(selectedFolder);

            // Tag filter
            const matchesTag =
                selectedTag === "all" ||
                item.tags.some((tag) => tag.id === Number(selectedTag));

            return matchesSearch && matchesFolder && matchesTag;
        });
    }, [media, searchQuery, selectedFolder, selectedTag]);

    const handleUpload = useCallback(() => {
        toast.info("Upload non encore implémenté (Phase 2 suite)");
    }, []);

    const toggleSelection = useCallback((mediaId: number) => {
        setSelectedIds((prev) =>
            prev.includes(mediaId)
                ? prev.filter((id) => id !== mediaId)
                : [...prev, mediaId]
        );
    }, []);

    const handleCardClick = useCallback((item: MediaItemExtendedDTO) => {
        if (selectionMode) {
            toggleSelection(item.id);
        } else {
            setSelectedMedia(item);
        }
    }, [selectionMode, toggleSelection]);

    return (
        <div className="space-y-6">
            {/* Bouton retour */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/admin/media")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Bibliothèque</h1>
                    <p className="text-muted-foreground mt-1">
                        {filteredMedia.length} média{filteredMedia.length > 1 ? "s" : ""}
                        {filteredMedia.length !== media.length && ` (sur ${media.length})`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={selectionMode ? "default" : "outline"}
                        onClick={() => {
                            setSelectionMode(!selectionMode);
                            setSelectedIds([]);
                        }}
                    >
                        {selectionMode ? "Mode sélection" : "Sélectionner"}
                    </Button>
                    <Button onClick={handleUpload}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Tous les dossiers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les dossiers</SelectItem>
                        <SelectItem value="root">Racine (sans dossier)</SelectItem>
                        {availableFolders.map((folder) => (
                            <SelectItem key={folder.id} value={String(folder.id)}>
                                {folder.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Tous les tags" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les tags</SelectItem>
                        {availableTags.map((tag) => (
                            <SelectItem key={tag.id} value={String(tag.id)}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: tag.color ?? undefined }}
                                    />
                                    {tag.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Media Grid */}
            {filteredMedia.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                        {media.length === 0
                            ? "Aucun média. Commencez par uploader des fichiers."
                            : "Aucun média ne correspond aux filtres."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {filteredMedia.map((item) => (
                        <MediaCard
                            key={item.id}
                            media={item}
                            isSelected={selectedIds.includes(item.id)}
                            selectionMode={selectionMode}
                            onSelect={handleCardClick}
                        />
                    ))}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <MediaBulkActions
                    selectedIds={selectedIds}
                    folders={availableFolders}
                    tags={availableTags}
                    onClearSelection={() => setSelectedIds([])}
                    onSuccess={() => {
                        router.refresh();
                        setSelectedIds([]);
                    }}
                />
            )}

            {/* Details Panel */}
            {selectedMedia && !selectionMode && (
                <MediaDetailsPanel
                    media={selectedMedia}
                    folders={availableFolders}
                    tags={availableTags}
                    onClose={() => setSelectedMedia(null)}
                    onUpdate={() => {
                        router.refresh();
                        setSelectedMedia(null);
                    }}
                />
            )}
        </div>
    );
}

interface MediaCardProps {
    media: MediaItemExtendedDTO;
    isSelected?: boolean;
    selectionMode?: boolean;
    onSelect?: (media: MediaItemExtendedDTO) => void;
}

function MediaCard({ media, isSelected, selectionMode, onSelect }: MediaCardProps) {
    const isImage = media.mime?.startsWith("image/") ?? false;

    // storage_path is already relative to medias bucket (e.g., "press-kit/logos/file.png")
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${media.storage_path}`;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-lg border bg-card cursor-pointer transition-all",
                selectionMode && "hover:border-primary",
                isSelected && "ring-2 ring-primary border-primary"
            )}
            onClick={() => onSelect?.(media)}
        >
            {/* Selection Checkbox */}
            {selectionMode && (
                <div className="absolute top-2 right-2 z-10">
                    <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected
                            ? "bg-primary border-primary"
                            : "bg-background/80 border-muted-foreground/50"
                    )}>
                        {isSelected && (
                            <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </div>
            )}
            <div className="aspect-square overflow-hidden bg-muted">
                {isImage ? (
                    <img
                        src={publicUrl}
                        alt={media.alt_text ?? media.filename ?? undefined}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                            // Fallback: hide broken image, show placeholder
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'fallback-icon flex h-full w-full items-center justify-center text-muted-foreground';
                                fallback.innerHTML = '<svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                                parent.appendChild(fallback);
                            }
                        }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            {media.mime?.split("/")[0] ?? "fichier"}
                        </p>
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="truncate text-sm font-medium">{media.filename}</p>
                <p className="text-xs text-muted-foreground">
                    {media.size_bytes !== null ? formatFileSize(media.size_bytes) : "Taille inconnue"}
                </p>
                {media.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {media.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                            >
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: tag.color ?? undefined }}
                                />
                                {tag.name}
                            </span>
                        ))}
                        {media.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{media.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

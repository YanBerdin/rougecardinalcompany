/**
 * @file MediaLibraryView (Client Component)
 * @description Interactive media library with filters, upload, and grid display
 */
"use client";

import { useRouter } from "next/navigation";
import { Upload, Search, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MediaDetailsPanel } from "./MediaDetailsPanel";
import { MediaBulkActions } from "./MediaBulkActions";
import { MediaCard } from "./MediaCard";
import { MediaUploadDialog } from "./MediaUploadDialog";
import { useMediaLibraryState } from "./hooks/useMediaLibraryState";
import type { MediaItemExtendedDTO, MediaTagDTO, MediaFolderDTO } from "@/lib/schemas/media";

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
    const router = useRouter(); // Used for back navigation only
    const {
        media,
        searchQuery,
        setSearchQuery,
        selectedFolder,
        setSelectedFolder,
        selectedTag,
        setSelectedTag,
        selectedMedia,
        setSelectedMedia,
        selectedIds,
        selectionMode,
        isUploadOpen,
        setIsUploadOpen,
        uploadFolder,
        setUploadFolder,
        filteredMedia,
        handleUploadSuccess,
        handleCardClick,
        toggleSelectionMode,
        clearSelection,
        handleBulkSuccess,
        handleDetailUpdate,
    } = useMediaLibraryState({ initialMedia, availableTags, availableFolders });

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
            <div className="flex flex-col gap-3">
                {/* Titre + compteur */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Médiathèque</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-md">
                        {filteredMedia.length} média{filteredMedia.length > 1 ? "s" : ""}
                        {filteredMedia.length !== media.length && ` (sur ${media.length})`}
                    </p>
                </div>

                {/* Actions — s'enroulent proprement sur mobile */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        variant={selectionMode ? "default" : "secondary"}
                        onClick={toggleSelectionMode}
                        className={cn(
                            "h-9 px-4 text-sm font-medium transition-all",
                            selectionMode && "ring-2 ring-primary ring-offset-2"
                        )}
                        aria-pressed={selectionMode}
                        aria-label={selectionMode ? "Quitter le mode sélection" : "Activer le mode sélection"}
                    >
                        {selectionMode ? "Mode sélection" : "Sélectionner"}
                    </Button>

                    <Select value={uploadFolder} onValueChange={setUploadFolder}>
                        <SelectTrigger
                            className="w-[180px] h-9 text-sm"
                            aria-label="Dossier d'upload"
                        >
                            <SelectValue placeholder="Dossier d'upload" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableFolders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.slug}>
                                    {folder.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => setIsUploadOpen(true)}
                        className="h-9 px-4 text-sm font-medium"
                        aria-label="Téléverser de nouveaux médias"
                    >
                        <Upload className="mr-1.5 h-4 w-4" />
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
                        <SelectItem value="root">Uploads génériques</SelectItem>
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
                    selectedMedia={media.filter(m => selectedIds.includes(m.id))}
                    folders={availableFolders}
                    tags={availableTags}
                    onClearSelection={clearSelection}
                    onSuccess={handleBulkSuccess}
                />
            )}

            {/* Details Panel */}
            {selectedMedia && !selectionMode && (
                <MediaDetailsPanel
                    media={selectedMedia}
                    folders={availableFolders}
                    tags={availableTags}
                    onClose={() => setSelectedMedia(null)}
                    onUpdate={handleDetailUpdate}
                />
            )}

            <MediaUploadDialog
                open={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSelect={handleUploadSuccess}
                uploadFolder={uploadFolder}
            />
        </div>
    );
}

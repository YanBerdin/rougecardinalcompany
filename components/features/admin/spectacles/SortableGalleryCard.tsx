"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildMediaPublicUrl } from "@/lib/dal/helpers/media-url";
import type { GalleryPhotoTransport } from "@/lib/schemas/spectacles";

// ============================================================================
// Types
// ============================================================================

import type { SortableGalleryCardProps } from "./types";

// ============================================================================
// Component
// ============================================================================

/**
 * Draggable card representing a single gallery photo.
 * Used inside a DndContext / SortableContext in SpectacleGalleryManager.
 */
export function SortableGalleryCard({
    photo,
    isPending,
    onDelete,
}: SortableGalleryCardProps): React.JSX.Element {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: photo.media_id });

    const dragStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    const imageUrl = buildMediaPublicUrl(photo.storage_path) ?? "";

    return (
        <Card
            ref={setNodeRef}
            style={dragStyle}
            className={
                isDragging
                    ? "shadow-lg ring-2 ring-primary/20"
                    : "hover:border-primary/50 transition-colors"
            }
        >
            <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-colors"
                            {...attributes}
                            {...listeners}
                            role="button"
                            tabIndex={0}
                            aria-label="Glisser pour réordonner"
                            title="Glisser pour réordonner"
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Badge variant="secondary">#{photo.ordre + 1}</Badge>
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        title="Supprimer cette photo"
                        aria-label={`Supprimer photo ${photo.ordre + 1}`}
                        onClick={() => onDelete(photo)}
                        disabled={isPending}
                        className="h-8 w-8"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                        src={imageUrl}
                        alt={photo.alt_text ?? `Photo galerie ${photo.ordre + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { ImagePlus, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    addGalleryPhotoAction,
    deleteGalleryPhotoAction,
    reorderGalleryPhotosAction,
} from "@/app/(admin)/admin/spectacles/spectacle-photo-actions";
import { MediaLibraryPicker } from "@/components/features/admin/media/MediaLibraryPicker";
import { MediaUploadDialog } from "@/components/features/admin/media/MediaUploadDialog";
import { SortableGalleryCard } from "@/components/features/admin/spectacles/SortableGalleryCard";
import type { GalleryPhotoTransport } from "@/lib/schemas/spectacles";

// ============================================================================
// Constants
// ============================================================================

const DRAG_ACTIVATION_DISTANCE_PX = 8;

// ============================================================================
// Types
// ============================================================================

import type { SpectacleGalleryManagerProps } from "./types";

// ============================================================================
// Main Component
// ============================================================================

export function SpectacleGalleryManager({
    spectacleId,
}: SpectacleGalleryManagerProps): React.JSX.Element {
    const [photos, setPhotos] = useState<GalleryPhotoTransport[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const lastDialogRef = useRef<"library" | "upload" | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<GalleryPhotoTransport | null>(null);
    const [showAddMoreDialog, setShowAddMoreDialog] = useState(false);

    // ---------- DnD Sensors ----------
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // ---------- Fetch photos ----------
    const fetchPhotos = useCallback(async (): Promise<void> => {
        try {
            const response = await fetch(
                `/api/admin/spectacles/${spectacleId}/gallery-photos`,
            );
            if (!response.ok) throw new Error("Failed to fetch gallery photos");

            const json = await response.json() as { success: true; data: GalleryPhotoTransport[] };
            setPhotos(json.data);
        } catch (error) {
            toast.error("Erreur lors du chargement de la galerie");
        }
    }, [spectacleId]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // ---------- Add photo ----------
    const handleMediaSelected = useCallback(
        async (result: { id: number; url: string; error?: string }): Promise<void> => {
            setIsPending(true);

            try {
                const actionResult = await addGalleryPhotoAction({
                    spectacle_id: spectacleId,
                    media_id: result.id,
                    ordre: photos.length,
                    type: "gallery" as const,
                });

                if (!actionResult.success) throw new Error(actionResult.error);

                await fetchPhotos();
                setShowAddMoreDialog(true);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Erreur lors de l'ajout",
                );
            } finally {
                setIsPending(false);
            }
        },
        [spectacleId, photos.length, fetchPhotos],
    );

    // ---------- Delete photo ----------
    const handleDeleteRequest = useCallback(
        (photo: GalleryPhotoTransport): void => {
            setPhotoToDelete(photo);
        },
        [],
    );

    const handleDeleteConfirm = useCallback(async (): Promise<void> => {
        if (!photoToDelete) return;

        setIsPending(true);
        try {
            const result = await deleteGalleryPhotoAction(
                photoToDelete.spectacle_id,
                photoToDelete.media_id,
            );
            if (!result.success) throw new Error(result.error);

            toast.success("Photo supprimée de la galerie");
            setPhotoToDelete(null);
            await fetchPhotos();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la suppression",
            );
            setPhotoToDelete(null);
        } finally {
            setIsPending(false);
        }
    }, [photoToDelete, fetchPhotos]);

    // ---------- Drag & drop reorder ----------
    const handleDragEnd = useCallback(
        async (event: DragEndEvent): Promise<void> => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

        // String coercion: dnd-kit UniqueIdentifier can be string | number
        const oldIndex = photos.findIndex((p) => String(p.media_id) === String(active.id));
        const newIndex = photos.findIndex((p) => String(p.media_id) === String(over.id));

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = arrayMove(photos, oldIndex, newIndex);

            setPhotos(reordered);

            try {
                const orderedIds = reordered.map((p) => p.media_id);
                const result = await reorderGalleryPhotosAction(
                    String(spectacleId),
                    orderedIds,
                );

                if (!result.success) {
                    toast.error(result.error ?? "Erreur lors du réordonnancement");
                    await fetchPhotos();
                    return;
                }

                toast.success("Ordre mis à jour");
                await fetchPhotos();
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Erreur lors du réordonnancement"
                );
                await fetchPhotos();
            }
        },
        [photos, spectacleId, fetchPhotos],
    );

    // ---------- Render ----------
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Galerie ({photos.length} photo{photos.length !== 1 ? "s" : ""})
                </h3>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => { lastDialogRef.current = "library"; setShowLibrary(true); }}
                        disabled={isPending}
                    >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Médiathèque
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { lastDialogRef.current = "upload"; setShowUpload(true); }}
                        disabled={isPending}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Téléverser
                    </Button>
                </div>
            </div>

            {photos.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <ImagePlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune photo dans la galerie</p>
                        <p className="text-sm mt-1">
                            Ajoutez des photos pour créer un carousel sur la page publique.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => { lastDialogRef.current = "library"; setShowLibrary(true); }}
                            disabled={isPending}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une photo
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <DndContext
                    id="gallery-photos-dnd"
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={photos.map((p) => p.media_id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {photos.map((photo) => (
                                <SortableGalleryCard
                                    key={photo.media_id}
                                    photo={photo}
                                    isPending={isPending}
                                    onDelete={handleDeleteRequest}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Media Library Picker */}
            {showLibrary && (
                <MediaLibraryPicker
                    open={showLibrary}
                    onClose={() => setShowLibrary(false)}
                    onSelect={handleMediaSelected}
                />
            )}

            {/* Media Upload Dialog */}
            {showUpload && (
                <MediaUploadDialog
                    open={showUpload}
                    onClose={() => setShowUpload(false)}
                    onSelect={handleMediaSelected}
                />
            )}

            {/* AlertDialog : confirmation de suppression */}
            <AlertDialog
                open={photoToDelete !== null}
                onOpenChange={(open) => { if (!open) setPhotoToDelete(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La photo sera définitivement retirée de la galerie du spectacle.
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Suppression…" : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog : ajouter une autre photo */}
            <Dialog open={showAddMoreDialog} onOpenChange={setShowAddMoreDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Photo ajoutée !</DialogTitle>
                        <DialogDescription>
                            La photo a été ajoutée à la galerie. Voulez-vous en ajouter une autre ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddMoreDialog(false)}
                        >
                            Terminé
                        </Button>
                        <Button
                            onClick={() => {
                                setShowAddMoreDialog(false);
                                if (lastDialogRef.current === "library") setShowLibrary(true);
                                else if (lastDialogRef.current === "upload") setShowUpload(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une autre
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

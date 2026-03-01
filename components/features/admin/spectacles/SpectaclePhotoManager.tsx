"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    addPhotoAction,
    deletePhotoAction,
} from "@/app/(admin)/admin/spectacles/spectacle-photo-actions";
import { MediaLibraryPicker } from "@/components/features/admin/media/MediaLibraryPicker";
import { MediaUploadDialog } from "@/components/features/admin/media/MediaUploadDialog";
import { buildMediaPublicUrl } from "@/lib/dal/helpers/media-url";
import type { SpectaclePhotoTransport } from "@/lib/schemas/spectacles";

// ============================================================================
// Types
// ============================================================================

import type { SpectaclePhotoManagerProps, PhotoSlot } from "./types";

// ============================================================================
// Component
// ============================================================================

export function SpectaclePhotoManager({
    spectacleId,
}: SpectaclePhotoManagerProps) {
    const [photos, setPhotos] = useState<PhotoSlot[]>([
        { ordre: 0, photo: null },
        { ordre: 1, photo: null },
    ]);
    const [isPending, setIsPending] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ ordre: number } | null>(null);

    // ✅ Fetch photos from API route (bigint→string already converted)
    const fetchPhotos = useCallback(async () => {
        try {
            const response = await fetch(`/api/spectacles/${spectacleId}/photos`);
            if (!response.ok) {
                throw new Error('Failed to fetch photos');
            }

            const data: SpectaclePhotoTransport[] = await response.json();

            // Map to PhotoSlot format
            const slots: PhotoSlot[] = [
                { ordre: 0, photo: data.find(p => p.ordre === 0) ?? null },
                { ordre: 1, photo: data.find(p => p.ordre === 1) ?? null },
            ];

            setPhotos(slots);
        } catch (error) {
            toast.error('Erreur lors du chargement des photos');
        }
    }, [spectacleId]);

    // Fetch on mount
    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // ========================================================================
    // Handlers
    // ========================================================================

    const handleSelectFromLibrary = (ordre: number) => {
        setSelectedSlot(ordre);
        setShowLibrary(true);
    };

    const handleUpload = (ordre: number) => {
        setSelectedSlot(ordre);
        setShowUpload(true);
    };

    const handleMediaSelected = async (result: { id: number; url: string; error?: string }) => {
        if (selectedSlot === null) return;

        setIsPending(true);
        setShowLibrary(false);

        try {
            const actionResult = await addPhotoAction({
                spectacle_id: spectacleId, // ✅ number - Zod converts to bigint
                media_id: result.id,        // ✅ number - Zod converts to bigint
                ordre: selectedSlot,
                type: "landscape",
            });

            if (!actionResult.success) {
                throw new Error(actionResult.error);
            }

            toast.success("Photo ajoutée avec succès");
            await fetchPhotos();  // ✅ Refresh data via API
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Erreur lors de l'ajout"
            );
        } finally {
            setIsPending(false);
            setSelectedSlot(null);
        }
    };

    const handleDelete = useCallback((ordre: number): void => {
        setDeleteTarget({ ordre });
    }, []);

    const handleDeleteConfirm = useCallback(async (): Promise<void> => {
        if (deleteTarget === null) return;

        const photo = photos.find((p) => p.ordre === deleteTarget.ordre)?.photo;
        if (!photo) {
            setDeleteTarget(null);
            return;
        }

        setIsPending(true);

        try {
            const result = await deletePhotoAction(
                photo.spectacle_id,
                photo.media_id
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Photo supprimée");
            setDeleteTarget(null);
            await fetchPhotos();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Erreur lors de la suppression"
            );
            setDeleteTarget(null);
        } finally {
            setIsPending(false);
        }
    }, [deleteTarget, photos, fetchPhotos]);

    // ========================================================================
    // Render
    // ========================================================================

    const hasAllPhotos = photos.every((slot) => slot.photo !== null);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((slot) => (
                    <Card key={slot.ordre} className="overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary">
                                    Photo {slot.ordre + 1}
                                </Badge>
                                {slot.photo && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        title="Supprimer cette photo"
                                        aria-label={`Supprimer photo ${slot.ordre + 1}`}
                                        onClick={() => handleDelete(slot.ordre)}
                                        disabled={isPending}
                                        className=""
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {slot.photo ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                    <Image
                                        src={buildMediaPublicUrl(slot.photo.storage_path) ?? ""}
                                        alt={slot.photo.alt_text ?? `Photo ${slot.ordre + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                                    <div className="text-center text-muted-foreground">
                                        <ImagePlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Aucune photo</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSelectFromLibrary(slot.ordre)}
                                    disabled={isPending || slot.photo !== null}
                                    className="flex-1"
                                >
                                    <ImagePlus className="h-4 w-4 mr-2" />
                                    Médiathèque
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpload(slot.ordre)}
                                    disabled={isPending || slot.photo !== null}
                                    className="flex-1"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Téléverser
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!hasAllPhotos && (
                <Alert>
                    <AlertDescription>
                        Ajoutez 2 photos format paysage (16:9) qui seront intégrées
                        dans le synopsis du spectacle sur la page publique.
                    </AlertDescription>
                </Alert>
            )}

            {/* Media Library Picker */}
            {showLibrary && (
                <MediaLibraryPicker
                    open={showLibrary}
                    onClose={() => {
                        setShowLibrary(false);
                        setSelectedSlot(null);
                    }}
                    onSelect={handleMediaSelected}
                />
            )}

            {/* Media Upload Dialog */}
            {showUpload && selectedSlot !== null && (
                <MediaUploadDialog
                    open={showUpload}
                    onClose={() => {
                        setShowUpload(false);
                        setSelectedSlot(null);
                    }}
                    onSelect={handleMediaSelected}
                />
            )}

            {/* AlertDialog : confirmation de suppression */}
            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La photo sera définitivement retirée du spectacle.
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
        </div>
    );
}

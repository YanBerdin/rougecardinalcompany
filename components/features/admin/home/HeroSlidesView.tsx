"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { toast } from "sonner";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { HeroSlideForm } from "./HeroSlideForm";
import { HeroSlidePreview } from "./HeroSlidePreview";
import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import {
    deleteHeroSlideAction,
    reorderHeroSlidesAction,
} from "@/app/(admin)/admin/home/hero/home-hero-actions";

interface HeroSlidesViewProps {
    initialSlides: HeroSlideDTO[];
}

interface SortableSlideProps {
    slide: HeroSlideDTO;
    onEdit: (slide: HeroSlideDTO) => void;
    onDelete: (id: number) => void;
}

function SortableSlide({ slide, onEdit, onDelete }: SortableSlideProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slide.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <Card ref={setNodeRef} style={style} className={isDragging ? "shadow-lg" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
                        {...attributes}
                        {...listeners}
                        role="button"
                        tabIndex={0}
                        aria-label="Drag to reorder"
                        title="Réorganiser le slide"
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <HeroSlidePreview slide={slide} />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(slide)}
                        aria-label="Edit slide"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(slide.id)}
                        aria-label="Delete slide"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
}

export function HeroSlidesView({ initialSlides }: HeroSlidesViewProps) {
    const router = useRouter();
    const [slides, setSlides] = useState(initialSlides);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlideDTO | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [slideToDelete, setSlideToDelete] = useState<{
        id: number;
        title: string;
    } | null>(null);

    // Sync local state when props change (after router.refresh())
    useEffect(() => {
        setSlides(initialSlides);
    }, [initialSlides]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px de mouvement requis pour activer le drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) return;

            const oldIndex = slides.findIndex((s) => s.id.toString() === active.id);
            const newIndex = slides.findIndex((s) => s.id.toString() === over.id);

            const reordered = arrayMove(slides, oldIndex, newIndex);
            setSlides(reordered);

            const orderData = reordered.map((slide, index) => ({
                id: Number(slide.id),
                position: index,
            }));

            try {
                // call server action directly (handles revalidation)
                const result = await reorderHeroSlidesAction(orderData);
                if (!result.success) {
                    throw new Error(result.error || "Reorder failed");
                }

                toast.success("Slides reordered successfully");
                // Server Action already called revalidatePath(), so just refresh
                router.refresh();
            } catch (err) {
                console.error('Reorder error:', err);
                toast.error("Failed to reorder slides");
                setSlides(initialSlides); // Rollback on error
            }
        },
        [slides, initialSlides, router]
    );

    const handleEdit = useCallback((slide: HeroSlideDTO) => {
        console.log('[HeroSlidesView] Edit clicked for slide:', slide.id, slide);
        // Use the slide data directly from the list (already fresh from server)
        setEditingSlide(slide);
        setIsFormOpen(true);
    }, []);

    const openDeleteDialog = useCallback((id: number, title: string) => {
        setSlideToDelete({ id, title });
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!slideToDelete) return;

        setIsPending(true);
        setDeleteDialogOpen(false);

        try {
            // call server action directly (handles revalidation)
            const result = await deleteHeroSlideAction(String(slideToDelete.id));
            if (!result.success) {
                throw new Error(result.error || "Delete failed");
            }

            toast.success("Slide deleted successfully");
            // Server Action already called revalidatePath(), so just refresh
            router.refresh();
        } catch (err) {
            console.error('Delete error:', err);
            toast.error("Failed to delete slide");
        } finally {
            setIsPending(false);
            setSlideToDelete(null);
        }
    }, [slideToDelete, router]);

    const handleFormClose = useCallback(() => {
        setIsFormOpen(false);
        setEditingSlide(null);
    }, []);

    const handleFormSuccess = useCallback(() => {
        console.log('[HeroSlidesView] Form success - triggering refresh...');

        // Fermer le formulaire immédiatement
        setIsFormOpen(false);
        setEditingSlide(null);

        // Utiliser router.refresh() pour recharger les Server Components
        // Les Server Actions ont déjà appelé revalidatePath(), donc les données sont fraîches
        router.refresh();
    }, [router]);



    const activeSlides = slides.filter((s) => s.active);
    const canAddMore = activeSlides.length < 10;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Hero Slides</h2>
                <Button
                    onClick={() => {
                        setEditingSlide(null);
                        setIsFormOpen(true);
                    }}
                    disabled={!canAddMore || isPending}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slide {!canAddMore && "(Max 10)"}
                </Button>
            </div>

            <DndContext
                id="hero-slides-dnd"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={slides.map((s) => s.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="grid gap-4">
                        {slides.map((slide) => (
                            <SortableSlide
                                key={slide.id.toString()}
                                slide={slide}
                                onEdit={handleEdit}
                                onDelete={() => openDeleteDialog(slide.id, slide.title)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {slides.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No hero slides yet. Create your first slide!
                    </CardContent>
                </Card>
            )}

            <HeroSlideForm
                open={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                slide={editingSlide}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression définitive</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action supprimera définitivement le slide &quot;
                            {slideToDelete?.title}&quot;? Voulez-vous continuer ? Cette opération est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isPending}
                            className="hover:text-destructive hover:bg-white "
                        >
                            {isPending ? "Suppression en cours..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

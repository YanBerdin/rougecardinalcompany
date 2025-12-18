"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { HeroSlideForm } from "./HeroSlideForm";
import { HeroSlidePreview } from "./HeroSlidePreview";
import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import { useHeroSlidesDnd } from "@/lib/hooks/useHeroSlidesDnd";
import { useHeroSlidesDelete } from "@/lib/hooks/useHeroSlidesDelete";
import { HERO_SLIDE_LIMITS } from "@/lib/constants/hero-slides";

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

    const dragStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
    };
    
    return (
        <Card ref={setNodeRef} style={dragStyle} className={isDragging ? "shadow-lg" : ""}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:pb-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div
                        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors shrink-0"
                        {...attributes}
                        {...listeners}
                        role="button"
                        tabIndex={0}
                        aria-label="Drag to reorder"
                    >
                        <GripVertical className="h-5 w-5 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>

                    <HeroSlidePreview slide={slide} />
                </div>

                <div className="flex gap-2 sm:gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(slide)}
                        aria-label="Edit slide"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(slide.id)}
                        aria-label="Delete slide"
                        className="h-9 w-9 sm:h-8 sm:w-8"
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

    useEffect(() => {
        setSlides(initialSlides);
    }, [initialSlides]);

    const { sensors, handleDragEnd } = useHeroSlidesDnd({
        slides,
        setSlides,
        initialSlides,
    });

    const {
        isDeleteDialogOpen,
        slideToDelete,
        isDeletePending,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
    } = useHeroSlidesDelete();

    const handleEdit = useCallback((slide: HeroSlideDTO) => {
        setEditingSlide(slide);
        setIsFormOpen(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setIsFormOpen(false);
        setEditingSlide(null);
    }, []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        setEditingSlide(null);
        router.refresh();
    }, [router]);

    const handleOpenNewSlideForm = useCallback(() => {
        setEditingSlide(null);
        setIsFormOpen(true);
    }, []);

    const activeSlidesCount = slides.filter((s) => s.active).length;
    const canAddMoreSlides = activeSlidesCount < HERO_SLIDE_LIMITS.MAX_ACTIVE_SLIDES;

    return (
        <div className="space-y-4">
            <HeroSlidesHeader
                canAddMore={canAddMoreSlides}
                isDisabled={isDeletePending}
                onAddSlide={handleOpenNewSlideForm}
            />

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

            <EmptySlidesPlaceholder isVisible={slides.length === 0} />

            <HeroSlideForm
                open={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                slide={editingSlide}
            />

            <DeleteSlideDialog
                isOpen={isDeleteDialogOpen}
                slideTitle={slideToDelete?.title}
                isPending={isDeletePending}
                onOpenChange={closeDeleteDialog}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

interface HeroSlidesHeaderProps {
    canAddMore: boolean;
    isDisabled: boolean;
    onAddSlide: () => void;
}

function HeroSlidesHeader({ canAddMore, isDisabled, onAddSlide }: HeroSlidesHeaderProps) {
    const buttonLabel = canAddMore
        ? "Add Slide"
        : `Add Slide (Max ${HERO_SLIDE_LIMITS.MAX_ACTIVE_SLIDES})`;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold">Hero Slides</h2>
            <Button 
                onClick={onAddSlide} 
                disabled={!canAddMore || isDisabled}
                className="w-full sm:w-auto h-10 sm:h-9"
            >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">{buttonLabel}</span>
            </Button>
        </div>
    );
}

interface EmptySlidesPlaceholderProps {
    isVisible: boolean;
}

function EmptySlidesPlaceholder({ isVisible }: EmptySlidesPlaceholderProps) {
    if (!isVisible) return null;

    return (
        <Card>
            <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
                <p className="text-sm sm:text-base">No hero slides yet. Create your first slide!</p>
            </CardContent>
        </Card>
    );
}

interface DeleteSlideDialogProps {
    isOpen: boolean;
    slideTitle: string | undefined;
    isPending: boolean;
    onOpenChange: () => void;
    onConfirm: () => void;
}

function DeleteSlideDialog({
    isOpen,
    slideTitle,
    isPending,
    onOpenChange,
    onConfirm,
}: DeleteSlideDialogProps) {
    const confirmButtonLabel = isPending ? "Suppression en cours..." : "Supprimer";

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-base sm:text-lg">Confirmer la suppression définitive</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Cette action supprimera définitivement le slide &quot;{slideTitle}&quot;.
                        Cette opération est irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <AlertDialogCancel 
                        disabled={isPending}
                        className="w-full sm:w-auto h-10 sm:h-9"
                    >
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="w-full sm:w-auto h-10 sm:h-9 hover:text-destructive hover:bg-white"
                    >
                        {confirmButtonLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import { reorderHeroSlidesAction } from "@/app/(admin)/admin/home/hero/home-hero-actions";
import { DRAG_CONFIG } from "@/lib/constants/hero-slides";

interface UseHeroSlidesDndParams {
    slides: HeroSlideDTO[];
    setSlides: (slides: HeroSlideDTO[]) => void;
    initialSlides: HeroSlideDTO[];
}

interface UseHeroSlidesDndReturn {
    sensors: ReturnType<typeof useSensors>;
    handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

export function useHeroSlidesDnd({
    slides,
    setSlides,
    initialSlides,
}: UseHeroSlidesDndParams): UseHeroSlidesDndReturn {
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: DRAG_CONFIG.ACTIVATION_DISTANCE_PX,
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

            const reorderedSlides = arrayMove(slides, oldIndex, newIndex);
            setSlides(reorderedSlides);

            const orderData = reorderedSlides.map((slide, index) => ({
                id: Number(slide.id),
                position: index,
            }));

            try {
                const result = await reorderHeroSlidesAction(orderData);
                if (!result.success) {
                    throw new Error(result.error ?? "Reorder failed");
                }

                toast.success("Slides reordered successfully");
                router.refresh();
            } catch {
                toast.error("Failed to reorder slides");
                setSlides(initialSlides);
            }
        },
        [slides, initialSlides, router, setSlides]
    );

    return { sensors, handleDragEnd };
}

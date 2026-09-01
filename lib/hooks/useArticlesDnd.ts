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
import type { ArticlesViewProps } from "@/components/features/admin/presse/types";
import { reorderArticlesAction } from "@/app/(admin)/admin/presse/press-articles-actions";

type Article = ArticlesViewProps["initialArticles"][number];

interface UseArticlesDndParams {
    articles: Article[];
    setArticles: (articles: Article[]) => void;
    initialArticles: Article[];
}

interface UseArticlesDndReturn {
    sensors: ReturnType<typeof useSensors>;
    handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

export function useArticlesDnd({
    articles,
    setArticles,
    initialArticles,
}: UseArticlesDndParams): UseArticlesDndReturn {
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) return;

            const oldIndex = articles.findIndex((a) => a.id === active.id);
            const newIndex = articles.findIndex((a) => a.id === over.id);

            const reordered = arrayMove(articles, oldIndex, newIndex);
            setArticles(reordered);

            const orderData = reordered.map((a, index) => ({
                id: a.id,
                display_order: index,
            }));

            try {
                const result = await reorderArticlesAction({ articles: orderData });
                if (!result.success) {
                    throw new Error(result.error ?? "Reorder failed");
                }

                toast.success("Ordre mis à jour");
                router.refresh();
            } catch {
                toast.error("Erreur lors de la réorganisation");
                setArticles(initialArticles);
            }
        },
        [articles, initialArticles, router, setArticles]
    );

    return { sensors, handleDragEnd };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, GripVertical } from "lucide-react";
import { deleteArticleAction } from "@/app/(admin)/admin/presse/press-articles-actions";
import { useArticlesDnd } from "@/lib/hooks/useArticlesDnd";
import { SortableArticleCard } from "./SortableArticleCard";
import type { ArticlesViewProps } from "./types";

export function ArticlesView({ initialArticles }: ArticlesViewProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const { sensors, handleDragEnd } = useArticlesDnd({
    articles,
    setArticles,
    initialArticles,
  });

  const requestDelete = useCallback((id: string) => {
    setDeleteCandidate(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setOpenDeleteDialog(false);

      try {
        const result = await deleteArticleAction(id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Article supprimé");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur");
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {articles.length} article{articles.length > 1 ? "s" : ""}
        </p>
        <Link href="/admin/presse/articles/new">
          <Button className="w-full sm:w-auto">
            <Plus className="size-4 mr-2" />
            <span className="hidden sm:inline">Nouvel article</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Aucun article de presse</p>
            <Link href="/admin/presse/articles/new">
              <Button variant="outline" className="mt-4">
                <Plus className="size-4 mr-2" />
                Ajouter le premier article
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <GripVertical className="size-4 inline-block" />
            Glissez-déposez pour réorganiser l&apos;ordre d&apos;affichage
          </p>
          <DndContext
            id="articles-dnd-context"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={articles.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                role="list"
                aria-label="Liste des articles de presse"
                className="space-y-3"
              >
                {articles.map((article) => (
                  <SortableArticleCard
                    key={article.id}
                    article={article}
                    onDelete={requestDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
              title="Annuler la suppression"
            >
              Annuler
            </Button>
            <Button
              variant="outline-destructive"
              onClick={() => deleteCandidate && handleDelete(deleteCandidate)}
              title="Confirmer la suppression de l'article"
            >
              Supprimer
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { deleteArticleAction } from "@/app/(admin)/admin/presse/press-articles-actions";
import type { ArticlesViewProps } from "./types";

export function ArticlesView({ initialArticles }: ArticlesViewProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

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
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvel article</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
      </div>

      {/* 
        MOBILE VIEW (Cards) 
        Visible only on small screens (< 640px)
      */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-card rounded-lg border shadow-sm p-4 space-y-3 hover:bg-card/60 transition-colors"
          >
            {/* Header: Title and Type */}
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2 flex-1">
                {article.title}
              </h3>
              {article.type && (
                <Badge variant="outline" className="flex-shrink-0">
                  {article.type}
                </Badge>
              )}
            </div>

            {/* Body: Author and Source */}
            <div className="space-y-1">
              {article.author && (
                <p className="text-sm text-muted-foreground">
                  Par {article.author}
                </p>
              )}
              {article.source_publication && (
                <p className="text-xs text-muted-foreground">
                  Source: {article.source_publication}
                </p>
              )}
            </div>

            {/* Footer: Actions */}
            <div className="flex items-center justify-between pt-3 border-t gap-2">
              {article.source_url ? (
                <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="secondary"
                    size="sm"
                    title="Voir l'article source"
                    aria-label="Voir l'article source"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Source
                  </Button>
                </a>
              ) : (
                <div />
              )}
              <div className="flex gap-1">
                <Link href={`/admin/presse/articles/${article.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Modifier"
                    aria-label="Modifier l'article"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => requestDelete(article.id)}
                  title="Supprimer"
                  aria-label="Supprimer l'article"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 
        DESKTOP VIEW (Cards) 
        Visible only on larger screens (>= 640px)
      */}
      <div className="hidden sm:block space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="hover:bg-card/60  transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{article.title}</h3>
                  {article.type && (
                    <Badge variant="outline">{article.type}</Badge>
                  )}
                </div>
                {article.author && (
                  <p className="text-sm text-muted-foreground">
                    Par {article.author}
                  </p>
                )}
                {article.source_publication && (
                  <p className="text-xs text-muted-foreground">
                    Source: {article.source_publication}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {article.source_url && (
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="Voir l'article source" aria-label="Voir l'article source">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Link href={`/admin/presse/articles/${article.id}/edit`}>
                  <Button variant="ghost" size="icon" title="Modifier" aria-label="Modifier l'article">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => requestDelete(article.id)}
                  title="Supprimer"
                  aria-label="Supprimer l'article"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

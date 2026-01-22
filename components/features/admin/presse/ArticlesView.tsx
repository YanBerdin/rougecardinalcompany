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
import { deleteArticleAction } from "@/app/(admin)/admin/presse/actions";
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">{articles.length} article(s)</p>
        <Link href="/admin/presse/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id}>
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
                  variant="destructive"
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
              variant="destructive"
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

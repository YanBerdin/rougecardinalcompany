"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { deleteArticleAction } from "@/app/(admin)/admin/presse/actions";
import type { ArticlesViewProps } from "./types";

export function ArticlesView({ initialArticles }: ArticlesViewProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer cet article ?")) return;

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
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Link href={`/admin/presse/articles/${article.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(article.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

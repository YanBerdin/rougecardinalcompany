"use client";

import Link from "next/link";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import type { SortableArticleCardProps } from "./types";

export function SortableArticleCard({
    article,
    onDelete,
}: SortableArticleCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: article.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} role="listitem" className="group hover:bg-card/50">
            {/*
              MOBILE VIEW
              Visible only on small screens (< 640px)
            */}
            <CardContent className="flex flex-col gap-3 p-4 sm:hidden">
                <div className="flex items-start gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab touch-none active:cursor-grabbing p-1 -m-1 mt-0.5 flex-shrink-0"
                        aria-label="Glisser pour réorganiser"
                    >
                        <GripVertical className="size-5 text-muted-foreground" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                            <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2 flex-1">
                                {article.title}
                            </h3>
                            {article.type && (
                                <Badge variant="outline" className="flex-shrink-0">
                                    {article.type}
                                </Badge>
                            )}
                        </div>

                        {article.author && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Par {article.author}
                            </p>
                        )}
                        {article.source_publication && (
                            <p className="text-xs text-muted-foreground">
                                Source : {article.source_publication}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t gap-2">
                    {article.source_url ? (
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" size="sm" aria-label="Voir l'article source">
                                <ExternalLink className="size-4 mr-1" />
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
                                aria-label={`Modifier l'article : ${article.title}`}
                            >
                                <Pencil className="size-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost-destructive"
                            size="icon"
                            onClick={() => onDelete(article.id)}
                            aria-label={`Supprimer l'article : ${article.title}`}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/*
              DESKTOP VIEW
              Visible only on larger screens (>= 640px)
            */}
            <CardContent className="hidden sm:flex items-center gap-3 p-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none active:cursor-grabbing flex-shrink-0"
                    aria-label="Glisser pour réorganiser"
                >
                    <GripVertical className="size-5 text-muted-foreground" />
                </button>

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
                            Source : {article.source_publication}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {article.source_url && (
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Voir l'article source"
                            >
                                <ExternalLink className="size-4" />
                            </Button>
                        </a>
                    )}
                    <Link href={`/admin/presse/articles/${article.id}/edit`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Modifier l'article : ${article.title}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost-destructive"
                        size="icon"
                        onClick={() => onDelete(article.id)}
                        aria-label={`Supprimer l'article : ${article.title}`}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

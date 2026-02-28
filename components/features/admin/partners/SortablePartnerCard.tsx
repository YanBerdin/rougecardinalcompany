"use client";

import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, GripVertical, ExternalLink } from "lucide-react";
import type { SortablePartnerCardProps } from "./types";

export function SortablePartnerCard({
    partner,
    onEdit,
    onDelete,
}: SortablePartnerCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: partner.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className="group hover:bg-card/50">
            {/*
              MOBILE VIEW
              Visible only on small screens (< 640px)
            */}
            <CardContent className="flex flex-col gap-4 p-4 sm:hidden">
                {/* Header: Drag handle + Logo + Name */}
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab touch-none active:cursor-grabbing p-2 -m-2"
                        aria-label="Glisser pour réorganiser"
                    >
                        <GripVertical className="h-6 w-6 text-muted-foreground" />
                    </button>

                    {partner.logo_url ? (
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                            <Image
                                src={partner.logo_url}
                                alt={partner.name}
                                fill
                                sizes="56px"
                                className="object-contain p-1"
                            />
                        </div>
                    ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                            Pas de logo
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base truncate">
                                {partner.name}
                            </h3>
                            {!partner.active && (
                                <Badge variant="secondary" className="text-xs">
                                    Inactif
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body: Website URL */}
                {partner.website_url && (
                    <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-chart-3 flex items-center gap-1"
                    >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{partner.website_url}</span>
                    </a>
                )}

                {/* Footer: Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(partner)}
                        className="h-10 min-w-[56px] px-3"
                        aria-label={`Modifier ${partner.name}`}
                    >
                        <Pencil className="h-5 w-5 mr-2" /> Modifier
                    </Button>
                    <Button
                        variant="ghost-destructive"
                        size="sm"
                        onClick={() => onDelete(partner.id)}
                        className="h-10 min-w-[56px] px-3"
                        aria-label={`Supprimer ${partner.name}`}
                    >
                        <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                    </Button>
                </div>
            </CardContent>

            {/*
              DESKTOP VIEW
              Visible only on larger screens (>= 640px)
            */}
            <CardContent className="hidden sm:flex items-center gap-4 p-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none active:cursor-grabbing"
                    aria-label="Glisser pour réorganiser"
                >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                {partner.logo_url ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                            src={partner.logo_url}
                            alt={partner.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                        />
                    </div>
                ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                        Pas de logo
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{partner.name}</h3>
                        {!partner.active && (
                            <Badge variant="secondary" className="text-xs">
                                Inactif
                            </Badge>
                        )}
                    </div>
                    {partner.website_url && (
                        <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-chart-3 flex items-center gap-1 truncate"
                        >
                            <span className="truncate">{partner.website_url}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(partner)}
                        title="Éditer"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        aria-label={`Modifier ${partner.name}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost-destructive"
                        size="icon"
                        onClick={() => onDelete(partner.id)}
                        title="Supprimer"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        aria-label={`Supprimer ${partner.name}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

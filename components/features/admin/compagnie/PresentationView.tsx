"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PresentationForm } from "./PresentationForm";
import type { PresentationViewProps } from "./types";
import type { PresentationSectionDTO } from "@/lib/schemas/compagnie-admin";

type SectionItem = Omit<PresentationSectionDTO, "id"> & { id: string };

const KIND_LABELS: Record<string, string> = {
    hero: "Héro",
    history: "Histoire",
    quote: "Citation",
    values: "Valeurs",
    team: "Équipe",
    mission: "Mission",
    custom: "Personnalisé",
};

export function PresentationView({ initialSections }: PresentationViewProps) {
    const router = useRouter();
    const [sections, setSections] = useState<SectionItem[]>(initialSections);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SectionItem | null>(null);

    // Sync local state when props change after router.refresh()
    useEffect(() => {
        setSections(initialSections);
    }, [initialSections]);

    const handleEdit = useCallback((item: SectionItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }, []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        setEditingItem(null);
        router.refresh();
    }, [router]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    {sections.length} section{sections.length !== 1 ? "s" : ""}
                </p>
                <Link href="/admin/compagnie/presentation">
                    <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Visualiser</span>
                    </Button>
                </Link>
            </div>

            {sections.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                    Aucune section disponible.
                </p>
            ) : (
                <ul className="space-y-2" aria-label="Liste des sections de présentation">
                    {sections.map((section) => (
                        <li
                            key={section.id}
                            className="flex flex-col gap-3 rounded-lg border p-4 bg-card hover:bg-card/40 transition-colors sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline">
                                        {KIND_LABELS[section.kind] ?? section.kind}
                                    </Badge>
                                    {section.title && (
                                        <span className="font-medium">{section.title}</span>
                                    )}
                                    {section.subtitle && (
                                        <span className="text-sm text-muted-foreground">
                                            — {section.subtitle}
                                        </span>
                                    )}
                                    <Badge variant={section.active ? "default" : "secondary"}>
                                        {section.active ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                                {section.quote_text && (
                                    <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground">
                                        « {section.quote_text} »
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                title="Modifier"
                                onClick={() => handleEdit(section)}
                                aria-label={`Modifier la section ${section.title ?? section.kind}`}
                                className="max-sm:h-10 max-sm:self-stretch"
                            >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                <span className="sm:hidden">Modifier</span>
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <PresentationForm
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSuccess={handleFormSuccess}
                item={editingItem}
            />
        </div>
    );
}

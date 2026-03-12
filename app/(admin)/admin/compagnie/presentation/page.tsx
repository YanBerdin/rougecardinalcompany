import { notFound } from "next/navigation";
import { requireMinRole } from "@/lib/auth/roles";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAllPresentationSectionsAdmin } from "@/lib/dal/admin-compagnie-presentation";

export const metadata = {
    title: "Visualiser Présentation | Admin Compagnie",
    description: "Visualisation des sections de présentation de la compagnie",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KIND_LABELS: Record<string, string> = {
    hero: "Héro",
    history: "Histoire",
    quote: "Citation",
    values: "Valeurs",
    team: "Équipe",
    mission: "Mission",
    custom: "Personnalisé",
};

export default async function PresentationViewPage() {
    await requireMinRole("editor");

    const result = await fetchAllPresentationSectionsAdmin();
    if (!result.success) notFound();

    const sections = result.data;

    return (
        <div className="space-y-6">
            {/* Header with navigation */}
            <div className="flex max-sm:flex-col items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">
                        Présentation de la Compagnie
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {sections.length} section{sections.length !== 1 ? "s" : ""} configurée{sections.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex w-full items-center gap-2 max-sm:flex-col sm:w-auto sm:shrink-0">
                    <Link href="/admin/compagnie" className="w-full sm:w-auto">
                        <Button variant="outline" size="default" className="w-full gap-2 sm:w-auto">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Retour
                        </Button>
                    </Link>
                    <Link href="/admin/compagnie" className="w-full sm:w-auto">
                        <Button variant="default" size="default" className="w-full gap-2 sm:w-auto">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Modifier
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Sections list */}
            {sections.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                    Aucune section de présentation configurée.
                </p>
            ) : (
                <div className="space-y-4">
                    {sections.map((section) => (
                        <article
                            key={section.id}
                            className="space-y-3 rounded-lg border bg-card p-4 sm:p-6"
                        >
                            {/* Section header */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                    {KIND_LABELS[section.kind] ?? section.kind}
                                </Badge>
                                <Badge variant={section.active ? "default" : "secondary"}>
                                    {section.active ? "Actif" : "Inactif"}
                                </Badge>
                            </div>

                            {/* Title & subtitle */}
                            {section.title && (
                                <h2 className="text-lg font-semibold">
                                    {section.title}
                                </h2>
                            )}
                            {section.subtitle && (
                                <p className="text-sm text-muted-foreground">
                                    {section.subtitle}
                                </p>
                            )}

                            {/* Quote */}
                            {section.quote_text && (
                                <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                                    <p>« {section.quote_text} »</p>
                                    {section.quote_author && (
                                        <footer className="mt-1 text-xs not-italic">
                                            — {section.quote_author}
                                        </footer>
                                    )}
                                </blockquote>
                            )}

                            {/* Content paragraphs */}
                            {section.content && section.content.length > 0 && (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {section.content.map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            )}

                            {/* Image info */}
                            {section.image_url && (
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Image :</span>{" "}
                                    <span className="break-all">{section.image_url}</span>
                                    {section.alt_text && (
                                        <span className="ml-2">
                                            (alt : {section.alt_text})
                                        </span>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

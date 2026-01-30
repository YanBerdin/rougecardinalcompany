"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Clock,
    Users,
    Calendar,
    Award,
    Play,
    Ticket,
    // ArrowRight,
    ArrowLeft,
    Star,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SpectacleDb } from "@/lib/schemas/spectacles";

interface SpectacleDetailViewProps {
    spectacle: SpectacleDb;
}

export function SpectacleDetailView({ spectacle }: SpectacleDetailViewProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Non définie";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return "Non précisée";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}min`;
    };

    const awards = spectacle.awards || [];
    const hasAwards = awards.length > 0;

    return (
        <main
            className=" bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground pt-16"
            aria-label={`Détails du spectacle ${spectacle.title}`}
        >
            {/* Skip to content link for keyboard navigation */}
            <a
                href="#spectacle-title"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold"
            >
                Aller au contenu principal
            </a>

            {/* Hero Section */}
            <section
                className="py-12 hero-gradient text-sidebar-primary-foreground"
                aria-labelledby="spectacle-genre"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 id="spectacle-genre" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
                        {spectacle.genre}
                    </h2>
                    {spectacle.short_description && (
                        <p
                            className="text-xl md:text-2xl italic leading-relaxed opacity-90 animate-fade-in max-w-3xl mx-auto"
                            style={{ animationDelay: "0.2s" }}
                        >
                            {spectacle.short_description}
                        </p>
                    )}
                </div>
            </section>

            {/* Content Section */}
            <section
                className="pt-8 md:pt-16 pb-16 md:pb-24 bg-card"
                aria-labelledby="synopsis"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-16">

                        {/* Affiche Column */}
                        <div className="md:col-span-2">
                            <div className="group  aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-4 border-white/80 dark:border-gray-800/80 transition-all hover:shadow-[0_25px_70px_rgba(173,0,0,0.4)] hover:scale-[1.02] sticky top-20">
                                {spectacle.image_url ? (
                                    <Image
                                        src={spectacle.image_url}
                                        alt={`Affiche du spectacle ${spectacle.title}`}
                                        fill
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        priority
                                        sizes="(max-width: 768px) 80vw, 30vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 hero-gradient flex items-center justify-center">
                                        <div className="text-center p-4">
                                            <Play className="h-12 w-12 mx-auto mb-2 text-primary-foreground/50" aria-hidden="true" />
                                            <p className="text-primary-foreground/80 font-medium text-sm">
                                                Affiche à venir
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Synopsis Column */}
                        <div className="md:col-span-2 space-y-6">

                            <h1 id="spectacle-title" className="text-4xl md:text-5xl lg:text-5xl font-bold mb-6 animate-fade-in-up">
                                {spectacle.title}
                            </h1>
                            {spectacle.short_description && (
                                <p
                                    className="text-xl md:text-2xl italic leading-relaxed opacity-90 animate-fade-in max-w-3xl mx-auto"
                                    style={{ animationDelay: "0.2s" }}
                                >
                                    {spectacle.short_description}
                                </p>
                            )}

                            <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
                                <p className="text-lg whitespace-pre-line first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-[0.8]">
                                    {spectacle.description || spectacle.short_description}
                                </p>
                            </div>

                            {/* Call to Actions */}
                            <div className="flex flex-col gap-4 pt-6">
                                {/* CTA Principaux : Réserver + Voir les dates */}
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="default"
                                        size="default"
                                        className="shadow-lg hover:shadow-xl transition-all touch-action-manipulation"
                                        asChild
                                    >
                                        <Link
                                            href="/contact?subject=reservation"
                                            aria-label={`Réserver des places pour ${spectacle.title}`}
                                        >
                                            <Ticket className="mr-2 h-4 w-4" /> Réserver
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="default"
                                        asChild
                                    >
                                        <Link href="/agenda" aria-label="Consulter l'agenda des représentations">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Voir les dates
                                        </Link>
                                    </Button>
                                </div>

                                {/* Lien secondaire : Retour */}
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="default"
                                        asChild
                                    >
                                        <Link
                                            href="/spectacles"
                                            aria-label="Retourner à la page listant tous les spectacles"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Tous les spectacles
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Awards Widget */}
                            {hasAwards && (
                                <Card className="backdrop-blur-lg bg-gradient-to-br from-yellow-50/90 to-orange-50/90 dark:from-yellow-950/30 dark:to-orange-950/30 border-2 border-yellow-200/50 dark:border-yellow-800/50 relative overflow-hidden group">
                                    <CardContent className="p-4">
                                        <div className="absolute -top-6 -right-6 text-yellow-200/30 dark:text-yellow-800/30 group-hover:text-yellow-300/40 dark:group-hover:text-yellow-700/40 transition-colors" aria-hidden="true">
                                            <Award size={140} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                                            <div className="p-2 bg-yellow-500/20 rounded-xl">
                                                <Award className="text-yellow-600 dark:text-yellow-400 h-6 w-6" aria-hidden="true" />
                                            </div>
                                            Palmarès
                                        </h3>
                                        <ul className="space-y-3 relative z-10" aria-label="Liste des récompenses">
                                            {awards.map((award, i) => (
                                                <li
                                                    key={i}
                                                    className="flex gap-3 text-md font-medium border-b border-yellow-200/30 dark:border-yellow-800/30 pb-3 last:border-0 transition-colors hover:text-primary"
                                                >
                                                    <Star
                                                        className="h-5 w-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5"
                                                        fill="currentColor"
                                                    />
                                                    <span>{award}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Informations Pratiques - Compact Badges */}
                        <div className="md:col-span-1 space-y-3">


                            {/* Genre */}
                            <div className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-primary flex-shrink-0" fill="currentColor" aria-hidden="true" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Genre</p>
                                    <Badge variant="outline" className="mt-1">
                                        {spectacle.genre || "Non précisé"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Comédiens */}
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Comédiens</p>
                                    <Badge variant="outline" className="mt-1">
                                        {spectacle.casting ? `${spectacle.casting} comédien${spectacle.casting > 1 ? 's' : ''}` : "Non précisé"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Durée */}
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Durée</p>
                                    <Badge variant="outline" className="mt-1">
                                        {formatDuration(spectacle.duration_minutes)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Première */}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Première</p>
                                    <Badge variant="outline" className="mt-1">
                                        {formatDate(spectacle.premiere)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Lieu */}
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Lieu</p>
                                    <Badge variant="outline" className="mt-1">
                                        À venir
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </main >
    );
}



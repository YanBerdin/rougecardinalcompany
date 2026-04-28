"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Clock,
    Calendar,
    Award,
    Play,
    Star,
    MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildMediaPublicUrl } from "@/lib/dal/helpers";
import { formatDurationHumanReadable } from "@/lib/tables/spectacle-table-helpers";
import type { SpectacleDb, SpectaclePhotoDTO, GalleryPhotoDTO } from "@/lib/schemas/spectacles";
import { SpectacleCarousel } from "./SpectacleCarousel";
import { SpectacleCTABar } from "./SpectacleCTABar";
import { LandscapePhotoCard } from "./LandscapePhotoCard";

interface SpectacleDetailViewProps {
    spectacle: SpectacleDb;
    landscapePhotos?: SpectaclePhotoDTO[];
    galleryPhotos?: GalleryPhotoDTO[];
    venue?: { nom: string; ville: string | null } | null;
    ticketUrl?: string | null;
    dateRange?: { start: string; end: string } | null;
}

export function SpectacleDetailView({
    spectacle,
    landscapePhotos = [],
    galleryPhotos = [],
    venue = null,
    ticketUrl = null,
    dateRange = null,
}: SpectacleDetailViewProps): React.ReactNode {
    const awards = spectacle.awards || [];
    const hasAwards = awards.length > 0;
    const formattedDateRange = dateRange
        ? dateRange.start === dateRange.end
            ? `Le ${new Date(dateRange.start).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
            : `${new Date(dateRange.start).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })} → ${new Date(dateRange.end).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
        : "À venir";
    const formattedVenue = venue ? `${venue.nom}${venue.ville ? ` - ${venue.ville}` : ""}` : "À venir";

    return (
        <main
            className="bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground pt-16"
            aria-label={`Détails du spectacle ${spectacle.title}`}
        >
            {/* Skip to content link for keyboard navigation */}
            <Link
                href="#spectacle-title"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold"
            >
                Aller au contenu principal
            </Link>

            {/* Mobile CTA — sticky sous le header, visible uniquement sur mobile */}
            {/*            <div
                className="sm:hidden sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3"
                aria-label="Actions principales"
            >
                <div className="flex gap-3">
                    <Button variant="default" size="sm" className="flex-1 shadow-md" asChild>
                        <Link
                            href={ticketUrl ?? "/contact?subject=reservation"}
                            aria-label={`Réserver des places pour ${spectacle.title}`}
                            {...(ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                            <Ticket className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Réserver
                        </Link>
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1" asChild>
                        <Link href="/agenda" aria-label="Consulter l'agenda des représentations">
                            <Calendar className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Voir les dates
                        </Link>
                    </Button>
                </div>
            </div>
*/}
            {/* Content Section */}
            <section
                className="pt-2 md:pt-8 pb-16 md:pb-24 bg-background"
                aria-labelledby="synopsis"
            >
                <div className="max-w-7xl mx-auto px-4 xl:px-0 ">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 lg:gap-16">

                        {/* Affiche Column */}
                        <div className="md:col-span-2 p-4 md:p-2 lg:p-0">
                            <div className="group rounded-lg overflow-hidden shadow-2xl border-4 border-white/80 dark:border-gray-800/80 transition-all hover:shadow-[0_25px_70px_rgba(173,0,0,0.4)] sticky top-20 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] mx-auto">
                                {spectacle.image_url ? (
                                    <Image
                                        src={spectacle.image_url}
                                        alt={`Affiche du spectacle ${spectacle.title}`}
                                        width={600}
                                        height={900}
                                        className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                        priority
                                        sizes="(max-width: 600px) 80vw, 30vw"
                                    />
                                ) : (
                                    <div className="aspect-[2/3] hero-gradient flex items-center justify-center">
                                        <div className="text-center p-4">
                                            <Play className="h-12 w-12 mx-auto mb-2 text-primary-foreground/50" aria-hidden="true" />
                                            <p className="text-primary-foreground/80 font-medium text-sm">
                                                Affiche à venir
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Synopsis Column */}
                        <div className="md:col-span-3 space-y-6">
                            {/* CTA Principaux : Réserver + Agenda (+ Retour) */}
                            <SpectacleCTABar
                                title={spectacle.title}
                                ticketUrl={ticketUrl}
                                agendaLabel="Voir les dates"
                            /> {/* backLabel="Tous les évènements" */}
                            <h1 id="spectacle-title" className="text-2xl md:text-3xl lg:text-4xl font-bold font-sans mb-6 animate-fade-in-up">
                                {spectacle.title}
                            </h1>
                            {spectacle.short_description && (
                                <p
                                    className="max-sm:text-lg text-xl md:text-2xl italic leading-relaxed opacity-90 animate-fade-in max-w-3xl mx-auto"
                                    style={{ animationDelay: "0.2s" }}
                                >
                                    {spectacle.short_description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3" aria-label="Période et lieu">
                                <Badge variant="outlineGold" className="text-xs sm:text-sm font-semibold shadow-lg">
                                    <Calendar className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                    {formattedDateRange}
                                </Badge>
                                <Badge variant="outlineGold" className="text-xs sm:text-sm font-semibold shadow-lg">
                                    <MapPin className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                    {formattedVenue}
                                </Badge>
                            </div>

                            {/* Photo 1 - after short_description */}
                            {landscapePhotos[0] && (
                                <LandscapePhotoCard photo={landscapePhotos[0]} />
                            )}

                            <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
                                <p className="max-sm:text-sm text-md lg:text-lg whitespace-pre-line first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-[0.8]">
                                    {spectacle.description || spectacle.short_description}
                                </p>
                            </div>

                            {/* Paragraphe supplémentaire 1 (après description, avant Photo 2) */}
                            {spectacle.paragraph_2 && (
                                <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed mt-6">
                                    <p className="max-sm:text-sm text-md lg:text-lg whitespace-pre-line">
                                        {spectacle.paragraph_2}
                                    </p>
                                </div>
                            )}

                            {/* Photo 2 - repositionnée après paragraph_2 */}
                            {landscapePhotos[1] && (
                                <LandscapePhotoCard photo={landscapePhotos[1]} />
                            )}

                            {/* Paragraphe supplémentaire 2 (après Photo 2, avant CTAs) */}
                            {spectacle.paragraph_3 && (
                                <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed mt-6">
                                    <p className="max-sm:text-sm text-md lg:text-lg whitespace-pre-line">
                                        {spectacle.paragraph_3}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3" aria-label="Durée et genre">
                                <Badge variant="outlineGold" className="text-xs sm:text-sm font-semibold shadow-lg">
                                    <Clock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                    {formatDurationHumanReadable(spectacle.duration_minutes)}
                                </Badge>
                                <Badge variant="outlineGold" className="text-xs sm:text-sm font-semibold shadow-lg">
                                    <Star className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                    {spectacle.genre}
                                </Badge>
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

                            {/* Gallery Carousel */}
                        </div>
                    </div>
                    {/* Gallery Carousel */}
                    <div className="max-sm:mt-8 mt-16">
                        {galleryPhotos && galleryPhotos.length > 0 && (
                            <div className="mt-8">
                                {/* <h2 className="text-2xl font-bold mb-4">Galerie</h2> */}
                                <SpectacleCarousel
                                    images={galleryPhotos.map((photo) => ({
                                        url: buildMediaPublicUrl(photo.storage_path) ?? "",
                                        alt: photo.alt_text,
                                    }))}
                                    title={spectacle.title}
                                />
                            </div>
                        )}
                    </div>
                    {/* Call to Actions */}
                    <div className="pt-4 md:pt-6 max-w-7xl flex justify-center">
                        <SpectacleCTABar
                            title={spectacle.title}
                            ticketUrl={ticketUrl}
                            agendaLabel="Voir les dates"
                        />
                        {/* backLabel="Tous les évènements" */}
                    </div>
                </div>

            </section>
        </main>
    );
}

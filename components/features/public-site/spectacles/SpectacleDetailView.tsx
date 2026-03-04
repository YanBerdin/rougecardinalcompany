"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Clock,
    Users,
    Calendar,
    Award,
    Play,
    Star,
    MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildMediaPublicUrl } from "@/lib/dal/helpers";
import { formatSpectaclePremiereShort, formatDurationHumanReadable } from "@/lib/tables/spectacle-table-helpers";
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
}

export function SpectacleDetailView({
    spectacle,
    landscapePhotos = [],
    galleryPhotos = [],
    venue = null,
    ticketUrl = null,
}: SpectacleDetailViewProps): React.ReactNode {
    const awards = spectacle.awards || [];
    const hasAwards = awards.length > 0;

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

            {/* Informations Pratiques - Horizontal Bar */}
            <section className="py-8 lg:py-12 bg-card flex justify-between" aria-label="Informations pratiques">
                <div className="max-w-7xl mx-auto max-sm:px-6 px-4">
                    <div className="grid max-sm:grid-cols-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-lg:gap-6">
                        {/* Genre */}
                        <div className="flex items-center gap-3">
                            <Star className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="ml-1 text-xs uppercase tracking-wide font-medium">Genre</p>
                                <Badge id="spectacle-genre" variant="outline" className="mt-1 text-xs sm:text-sm shadow-lg">
                                    {spectacle.genre}
                                </Badge>
                            </div>
                        </div>

                        {/* Comédiens */}
                        <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="ml-1 text-xs uppercase tracking-wide font-medium">Comédiens</p>
                                <Badge variant="outline" className="mt-1 text-xs sm:text-sm font-semibold shadow-lg">
                                    {spectacle.casting ? `${spectacle.casting} comédien${spectacle.casting > 1 ? 's' : ''}` : "Non précisé"}
                                </Badge>
                            </div>
                        </div>

                        {/* Durée */}
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="ml-1 text-xs uppercase tracking-wide font-medium">Durée</p>
                                <Badge variant="outline" className="mt-1 text-xs sm:text-sm font-semibold shadow-lg">
                                    {formatDurationHumanReadable(spectacle.duration_minutes)}
                                </Badge>
                            </div>
                        </div>

                        {/* Première */}
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="ml-1 text-xs uppercase tracking-wide font-medium">Première</p>
                                <Badge variant="outline" className="mt-1 text-xs sm:text-sm font-semibold shadow-lg">
                                    {formatSpectaclePremiereShort(spectacle.premiere)}
                                </Badge>
                            </div>
                        </div>

                        {/* Lieu */}
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="ml-1 text-xs uppercase tracking-wide font-medium">Lieu</p>
                                <Badge variant="outline" className="mt-1 text-xs sm:text-sm font-semibold shadow-lg">
                                    {venue ? (
                                        <>
                                            {venue.nom}
                                            {venue.ville && ` - ${venue.ville}`}
                                        </>
                                    ) : (
                                        "À venir"
                                    )}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section
                className="pt-2 md:pt-8 pb-16 md:pb-24 bg-card"
                aria-labelledby="synopsis"
            >
                <div className="max-w-7xl mx-auto px-4 xl:px-0 ">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 lg:gap-16">

                        {/* Affiche Column */}
                        <div className="md:col-span-2 p-4 md:p-2 lg:p-0">
                            <div className="group aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-4 border-white/80 dark:border-gray-800/80 transition-all hover:shadow-[0_25px_70px_rgba(173,0,0,0.4)] hover:scale-[1.02] sticky top-20">
                                {spectacle.image_url ? (
                                    <Image
                                        src={spectacle.image_url}
                                        alt={`Affiche du spectacle ${spectacle.title}`}
                                        fill
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        priority
                                        sizes="(max-width: 600px) 80vw, 30vw"
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
                        <div className="md:col-span-3 space-y-6">
                            {/* CTA Principaux : Réserver + Agenda + Retour */}
                            <SpectacleCTABar title={spectacle.title} ticketUrl={ticketUrl} />
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

                            {/* Call to Actions */}
                            <div className="pt-4 md:pt-6">
                                <SpectacleCTABar
                                    title={spectacle.title}
                                    ticketUrl={ticketUrl}
                                    agendaLabel="Voir les dates"
                                    backLabel="Tous les spectacles"
                                />
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
                </div>

            </section>
        </main>
    );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Ticket } from "lucide-react"; // Clock, Users, Calendar, MapPin, non utilisés
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpectaclesViewProps } from "./types";
import type { CurrentShow, ArchivedShow } from "@/lib/schemas/spectacles";
import { FALLBACK_SPECTACLE_IMAGE } from "./constants";

const MAX_INITIAL_ARCHIVED_SHOWS = 6;

const getSpectacleUrl = (show: CurrentShow | ArchivedShow): string => {
  return `/spectacles/${show.slug || show.id}`;
};

export function SpectaclesView({
  currentShows,
  archivedShows,
}: SpectaclesViewProps): React.ReactNode {
  const [showAllArchived, setShowAllArchived] = useState(false);

  const displayedArchivedShows = showAllArchived
    ? archivedShows
    : archivedShows.slice(0, MAX_INITIAL_ARCHIVED_SHOWS);
  const hasMoreArchivedShows = archivedShows.length > MAX_INITIAL_ARCHIVED_SHOWS;

  return (
    <div className="max-sm:pt-12 pt-16">
      {/* Hero Section */}
      <section className="py-8 lg:py-12 hero-gradient" aria-labelledby="spectacles-hero-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 id="spectacles-hero-heading" className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
            À l&apos;Affiche
          </h1>
          <p
            className="text-base md:text-xl lg:text-2xl text-white/90 opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Nos créations actuellement en représentation
          </p>
        </div>
      </section>

      {/* Spectacles Actuels lg:w-[calc(33.333%-1.33rem)] */}
      <section className="max-sm:py-12 py-16 bg-chart-7" aria-label="Spectacles actuels">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-16">
            {currentShows.map((show, index) => (
              <Card
                key={show.id}
                className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)]  max-w-md group border-0 shadow-none bg-transparent hover:bg-card`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                  <Link href={getSpectacleUrl(show)} className="block absolute inset-0 z-0">
                    <Image
                      src={show.image || FALLBACK_SPECTACLE_IMAGE}
                      alt={`Affiche du spectacle ${show.title}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Link>

                  {/* Hover overlay with links — outside the image Link to avoid nested anchors */}
                  {/* pointer-events-none kept for mouse; group-focus-within enables keyboard access */}
                  <div className="absolute inset-0 z-10 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                    <div className="flex flex-col gap-3 px-6 w-full">
                      <Link
                        href={show.ticketUrl ?? getSpectacleUrl(show)}
                        {...(show.ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        aria-label={`Réserver des billets pour ${show.title}${show.ticketUrl ? " (s'ouvre dans un nouvel onglet)" : ""}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-chart-6 hover:text-black transition-colors w-full focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:outline-none"
                      >
                        <Ticket className="h-4 w-4" aria-hidden="true" />
                        Réserver mes billets
                      </Link>
                      <Link
                        href={getSpectacleUrl(show)}
                        aria-label={`Voir les détails de ${show.title}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white/40 border border-white/50 px-4 py-2 text-sm font-medium text-chart-6 w-full hover:bg-chart-6 hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:outline-none"
                      >
                        <Play className="h-5 w-5" aria-hidden="true" />
                        Détails
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  <Badge className="bg-primary text-primary-foreground">
                    {show.genre}
                  </Badge>
                  {show.awards.length > 0 && (
                    <Badge className="bg-yellow-500 text-yellow-900">
                      {show.awards[0]}
                    </Badge>
                  )}
                </div>

                {/* Card Footer */}
                <div className="py-2 text-center">
                  <h3 className="text-xl font-bold font-sans text-foreground line-clamp-2">
                    {show.title}
                  </h3>
                  {show.premiere && (
                    <p className="text-md text-foreground font-semibold mt-1">
                      Première : {new Date(show.premiere).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Archives */}
      <section className="py-20 bg-chart-7/60" aria-labelledby="spectacles-archives-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="spectacles-archives-heading" className="text-3xl md:text-4xl font-sans lg:text-5xl font-bold mb-4">Nos Créations Passées</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Les créations qui ont marqué notre parcours
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-16">
            {displayedArchivedShows.map((show, index) => (
              <Card
                key={show.id}
                className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] max-w-xs group border-0 shadow-none bg-transparent`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={getSpectacleUrl(show)} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={show.image || FALLBACK_SPECTACLE_IMAGE}
                      alt={`Affiche du spectacle ${show.title}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Hover overlay with button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex flex-col gap-3 px-6 w-full">
                        <span className="inline-flex items-center justify-center gap-2 rounded-md bg-white/40 border border-white/50 px-4 py-2 text-sm font-medium text-chart-6 w-full hover:bg-chart-6 hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:outline-none">
                          <Play className="h-5 w-5" aria-hidden="true" />
                          Détails
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {show.genre}
                  </Badge>
                  {show.awards.length > 0 && (
                    <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-500/90 text-xs">
                      {show.awards[0]}
                    </Badge>
                  )}
                </div>

                {/* Card Footer */}
                <div className="py-2 text-center">
                  <h3 className="text-xl font-bold font-sans text-foreground line-clamp-1">
                    {show.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              {showAllArchived
                ? `${archivedShows.length} créations depuis 2008`
                : hasMoreArchivedShows
                  ? `${displayedArchivedShows.length} créations affichées sur ${archivedShows.length} au total depuis 2008`
                  : `${archivedShows.length} créations depuis 2008`}
            </p>
            {hasMoreArchivedShows && (
              <Button
                variant="default"
                size="lg"
                className="cta-blur-button"
                onClick={() => setShowAllArchived(!showAllArchived)}
              >
                <ArrowRight
                  className={`h-5 w-5 transition-transform ${showAllArchived ? "rotate-180" : ""}`}
                />
                {showAllArchived ? "Voir moins" : "Voir toutes nos créations"}

              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

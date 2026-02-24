"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react"; // Clock, Users, Calendar, MapPin, non utilisés
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpectaclesViewProps } from "./types";
import { SpectaclesSkeleton } from "@/components/skeletons/spectacles-skeleton";
import type { CurrentShow, ArchivedShow } from "@/lib/schemas/spectacles";

// Helper to get spectacle URL (fallback to ID if slug is missing)
const getSpectacleUrl = (show: CurrentShow | ArchivedShow): string => {
  return `/spectacles/${show.slug || show.id}`;
};

export function SpectaclesView({
  currentShows,
  archivedShows,
  loading = false,
}: SpectaclesViewProps) {
  const [showAllArchived, setShowAllArchived] = useState(false);

  // Display initially 6 archived shows, then all if requested (adjusted for current content)
  const displayedArchivedShows = showAllArchived
    ? archivedShows
    : archivedShows.slice(0, 6);
  const hasMoreArchivedShows = archivedShows.length > 6;
  if (loading) {
    return <SpectaclesSkeleton />;
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-8 lg:py-12 hero-gradient text-chart-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
            À l&apos;Affiche
          </h1>
          <p
            className="text-lg md:text-xl lg:text-2xl text-chart-6 opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Nos créations actuellement en représentation
          </p>
        </div>
      </section>

      {/* Spectacles Actuels lg:w-[calc(33.333%-1.33rem)] */}
      <section className="py-16 bg-chart-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-16">
            {currentShows.map((show, index) => (
              <Card
                key={show.id}
                className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)]  max-w-md group border-0 shadow-none bg-transparent hover:bg-card`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={getSpectacleUrl(show)} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${show.image})` }}
                    />

                    {/* Hover overlay with buttons */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex flex-col gap-3 px-6 w-full">
                        <Button variant="default"
                          size="lg" className="w-full" asChild>
                          <span>
                            <ArrowRight className="h-4 w-4" />
                            Je réserve
                          </span>

                        </Button>
                        <Button variant="outline"
                          size="lg" className="w-full bg-white/40 border-white text-chart-6 hover:bg-chart-6 hover:text-black shadow-lg" asChild>
                          <span>
                            <Play className="h-5 w-5" />
                            Détails
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>

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
                  <h3 className="text-xl font-bold text-foreground line-clamp-2">
                    {show.title}
                  </h3>
                  <p className="text-md text-foreground font-semibold mt-1">
                    Première : {new Date(show.premiere).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Archives */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Nos Créations Passées</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              15 ans de créations théâtrales qui ont marqué notre parcours
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-16">
            {displayedArchivedShows.map((show, index) => (
              <Card
                key={show.id}
                className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] max-w-xs group border-0 shadow-none bg-transparent hover:bg-secondary`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={getSpectacleUrl(show)} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${show.image})` }}
                    />

                    {/* Hover overlay with button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex flex-col gap-3 px-6 w-full">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full bg-white/40 border-white text-chart-6 hover:bg-chart-6 hover:text-black shadow-lg"
                          asChild
                        >
                          <span>
                            <Play className="h-5 w-5" />
                            Détails
                          </span>
                        </Button>
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
                  <h3 className="text-xl font-bold text-foreground line-clamp-1">
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

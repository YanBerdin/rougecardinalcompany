"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react"; // Calendar, MapPin, non utilisés
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
      <section className="py-16 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
            À l&apos;Affiche
          </h1>
          <p
            className="text-xl md:text-2xl opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Nos créations actuellement en représentation
          </p>
        </div>
      </section>

      {/* Spectacles Actuels */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-wrap justify-center gap-12">
            {currentShows.map((show, index) => (
              <Card
                key={show.id}
                className={`card-hover animate-fade-in-up overflow-hidden w-full lg:w-[calc(50%-1.5rem)] max-w-2xl`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="relative">
                    <div
                      className="h-64 md:h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${show.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {show.genre}
                      </Badge>
                    </div>
                    {show.awards.length > 0 && (
                      <div className="absolute bottom-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500 text-yellow-900"
                        >
                          {show.awards[0]}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-primary font-medium card-date">
                          Première :{" "}
                          {new Date(show.premiere).toLocaleDateString("fr-FR")}
                          {/*
                          <span className="ml-2 text-xs text-muted-foreground">
                            Année :{" "}
                            {show.premiere
                              ? new Date(show.premiere).getFullYear()
                              : "-"}
                          </span>
                          */}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-4 hover:text-primary transition-colors card-title">
                        <Link href={getSpectacleUrl(show)}>
                          {show.title}
                        </Link>
                      </h3>

                      <p className="mb-6 leading-relaxed card-text">
                        {show.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-6 card-meta">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {show.duration_minutes}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          {show.cast} comédiens
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="default" className="flex-1" asChild>
                        <Link href={getSpectacleUrl(show)}>Réserver</Link>
                      </Button>
                      <Button variant="secondary" asChild className="btn-outline">
                        <Link href={getSpectacleUrl(show)}>
                          Détails
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Archives */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nos Créations Passées</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              15 ans de créations théâtrales qui ont marqué notre parcours
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {displayedArchivedShows.map((show, index) => (
              <Card
                key={show.id}
                className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${show.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">
                      {show.premiere
                        ? new Date(show.premiere).getFullYear()
                        : "-"}
                    </Badge>
                  </div>
                  {show.awards.length > 0 && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                        {show.awards[0]}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 text-white text-sm card-meta">
                    {show.genre}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors card-title">
                    <Link href={getSpectacleUrl(show)}>{show.title}</Link>
                  </h3>
                  <p className="text-sm leading-relaxed mb-4 card-text">
                    {show.description}
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="secondary"
                    className="w-full btn-outline px-4 py-2 rounded-lg"
                    asChild
                  >
                    <Link href={getSpectacleUrl(show)}>
                      Voir les détails
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
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
                {showAllArchived ? "Voir moins" : "Voir toutes nos créations"}
                <ArrowRight
                  className={`ml-2 h-5 w-5 transition-transform ${showAllArchived ? "rotate-180" : ""}`}
                />
              </Button>
            )}
            {/* Debug info - TODO: remove in production */}
            {/*
            }
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 text-xs text-muted-foreground">
                                Debug: {archivedShows.length} spectacles archivés | Seuil: 6 | Bouton visible: {hasMoreArchivedShows ? 'Oui' : 'Non'}
                            </div>
                        )}
            */
            }
          </div>
        </div>
      </section>
    </div>
  );
}

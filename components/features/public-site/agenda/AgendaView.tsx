"use client";

import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgendaViewProps } from "./types";
import { AgendaSkeleton } from "@/components/skeletons/agenda-skeleton";

export function AgendaView({
  events,
  eventTypes,
  filterType,
  setFilterType,
  generateCalendarFile,
  loading = false,
}: AgendaViewProps) {
  if (loading) {
    return <AgendaSkeleton />;
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Agenda
          </h1>
          <p
            className="text-xl md:text-2xl opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Retrouvez-nous sur scène
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 border-b">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Liste des événements */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {events.map((event, index) => (
              <Card
                key={event.id}
                className={`card-hover animate-fade-in-up overflow-hidden shows-card-dark`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
                  {/* Image */}
                  <div className="relative">
                    <div
                      className="h-32 md:h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${event.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant={
                          event.type === "Spectacle"
                            ? "default"
                            : event.type === "Première"
                              ? "destructive"
                              : event.type === "Rencontre"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {event.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Contenu */}
                  <CardContent className="md:col-span-3 lg:col-span-4 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                      {/* Info principale */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold hover:text-primary transition-colors card-title">
                            {event.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              event.status === "Bientôt complet"
                                ? "border-orange-500 text-orange-600"
                                : event.status === "Gratuit"
                                  ? "border-green-500 text-green-600"
                                  : ""
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>

                        <div className="space-y-3 card-meta">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-3 text-primary" />
                            <span className="font-medium">
                              {new Date(event.date).toLocaleDateString(
                                "fr-FR",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-3 text-primary" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-3 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium">{event.venue}</div>
                              <div className="text-sm">{event.address}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-center space-y-3">
                        {event.ticketUrl && (
                          <Button className="w-full btn-primary" asChild>
                            <a
                              href={event.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {event.type === "Atelier"
                                ? "S'inscrire"
                                : "Réserver"}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        )}

                        <Button
                          className="w-full btn-outline"
                          onClick={() => generateCalendarFile(event)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Ajouter au calendrier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Aucun événement trouvé pour ce filtre.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA - MAINTENANT ROUGE COMME "RESTEZ INFORMÉ" */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ne Manquez Rien
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Inscrivez-vous à notre newsletter pour être informé en
            avant-première de nos prochaines représentations et événements.
          </p>
          <Button
            size="lg"
            className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 shadow-lg border"
            asChild
          >
            <Link href="/contact#newsletter">S'abonner aux actualités</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

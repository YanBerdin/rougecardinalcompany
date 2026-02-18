"use client";

import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Download,
  Filter,
  CheckCircle,
  Info,
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
import { NewsletterForm } from "@/components/features/public-site/home/newsletter";
import { AgendaViewProps } from "./types";
import { AgendaSkeleton } from "@/components/skeletons/agenda-skeleton";

export function AgendaView({
  events,
  eventTypes,
  filterType,
  setFilterType,
  generateCalendarFile,
  loading = false,
  showNewsletterSection = false,
  newsletterEmail = "",
  newsletterIsSubscribed = false,
  newsletterIsLoading = false,
  newsletterErrorMessage = null,
  onNewsletterEmailChange,
  onNewsletterSubmit,
}: AgendaViewProps) {
  if (loading) {
    return <AgendaSkeleton />;
  }

  return (
    <div className="pt-16 bg-card/30">
      {/* Hero Section */}
      <section className="py-16 hero-gradient text-chart-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
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
      <section className="py-16 bg-card/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 pb-8">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-64  bg-card">
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


        {/* Liste des événements */}

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {events.map((event, index) => (
              <Card
                key={event.id}
                className={`card-hover animate-fade-in-up overflow-hidden`}
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
                  <CardContent className="md:col-span-3 lg:col-span-4 p-6 bg-card">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                      {/* Info principale */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                          {event.spectacleSlug ? (
                            <Link
                              href={`/spectacles/${event.spectacleSlug}`}
                              className="text-xl font-bold hover:text-primary transition-colors card-title group"
                            >
                              {event.title}
                              <ExternalLink className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ) : (
                            <h3 className="text-xl font-bold card-title">
                              {event.title}
                            </h3>
                          )}
                          <Badge
                            variant="outline"
                            className="text-md h-6 p-4"
                          >
                            {event.type}
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
                          <Button variant="default" asChild>
                            <Link
                              href={event.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {event.type === "Atelier"
                                ? "S&apos;inscrire"
                                : "Réserver"}
                            </Link>
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          onClick={() => generateCalendarFile(event)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Ajouter au calendrier
                        </Button>

                        <Button variant="outline" asChild>
                          <Link href={`/agenda/${event.id}`}>
                            <Info className="mr-2 h-4 w-4" />
                            Détails de l&apos;événement
                          </Link>
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

      <div className="w-full h-16 bg-card/30"></div>

      {/* Newsletter CTA Section */}
      {showNewsletterSection && (
        <section className="py-16 hero-gradient">
          <div className="max-w-6xl mx-auto grid grid-cols-1 gap-x-8 lg:gap-y-6 lg:grid-cols-[3fr_2fr] px-4">
            {/* Colonne gauche */}
            <dl className="flex gap-6 mx-auto">
              <div className="flex flex-col items-center lg:items-start">
                <p className="text-md lg:text-lg text-white/80">
                  Dernier acte
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight">
                  Restez dans les coulisses
                </h2>
                <div className="h-px w-24 xl:w-72 bg-white/40 my-6"></div>
              </div>
            </dl>

            {/* Colonne droite */}
            <div className="flex mx-auto items-start text-center lg:text-left lg:mt-4">
              {newsletterIsSubscribed ? (
                <div className="animate-fade-in text-center lg:text-left">
                  <CheckCircle className="h-16 w-16 text-white mx-auto lg:mx-0 mb-6" />
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Merci pour votre inscription !
                  </h3>
                  <p className="text-xl text-white/90">
                    Vous recevrez bientôt nos actualités et nos invitations privilégiées.
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  {newsletterErrorMessage && (
                    <p className="text-red-200 text-sm mb-4">{newsletterErrorMessage}</p>
                  )}
                  {onNewsletterEmailChange && onNewsletterSubmit && (
                    <NewsletterForm
                      email={newsletterEmail}
                      isLoading={newsletterIsLoading}
                      isSubscribed={newsletterIsSubscribed}
                      errorMessage={newsletterErrorMessage}
                      onEmailChange={onNewsletterEmailChange}
                      onSubmit={onNewsletterSubmit}
                    />
                  )}
                  <p className="text-white/70 text-sm mt-4">
                    Nous respectons votre vie privée. Désinscription en 1 clic.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <div className="w-full h-16 bg-card/30"></div>
    </div>
  );
}

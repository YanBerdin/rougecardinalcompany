import Image from "next/image";
import Link from "next/link";
import { Play, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Show } from "./types";

interface ShowCardProps {
  show: Show;
  index: number;
}

export function ShowCard({ show, index }: ShowCardProps) {
  const spectacleUrl = `/spectacles/${show.slug}`;

  return (
    <div
      className="card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)] max-w-md group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
        <Link href={spectacleUrl} className="block absolute inset-0 z-0">
          <Image
            src={show.image}
            alt={show.image ? `Affiche du spectacle ${show.title}` : `Image par défaut – affiche non disponible pour ${show.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Hover overlay — outside the image Link to avoid nested anchors */}
        {/* pointer-events-none kept for mouse (so image link stays clickable when invisible) */}
        {/* group-focus-within:pointer-events-auto enables click when keyboard-focused */}
        <div className="absolute inset-0 z-10 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
          <div className="flex flex-col gap-3 px-6 w-full">
            <Link
              href={show.ticketUrl ?? spectacleUrl}
              {...(show.ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={`Réserver des billets pour ${show.title}${show.ticketUrl ? " (s'ouvre dans un nouvel onglet)" : ""}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground w-full hover:bg-chart-6 hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Réserver mes billets
            </Link>
            <Link
              href={spectacleUrl}
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
        {show.genre && (
          <Badge className="bg-primary text-primary-foreground">{show.genre}</Badge>
        )}
        {show.dates && show.dates.length > 0 ? (
          <>
            {show.dates.slice(0, 3).map((date, i) => (
              <Badge key={i} className="bg-primary text-primary-foreground">
                {new Date(date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </Badge>
            ))}
            {show.dates.length > 3 && (
              <Badge className="bg-primary/80 text-primary-foreground">
                +{show.dates.length - 3} dates
              </Badge>
            )}
          </>
        ) : (
          <Badge className="bg-muted text-muted-foreground">Dates à venir</Badge>
        )}
      </div>

      {/* Titre */}
      <div className="py-2 text-center">
        <h3 className="text-xl font-bold text-foreground line-clamp-2">
          <Link href={spectacleUrl}>{show.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {show.short_description}
        </p>
      </div>
    </div>
  );
}

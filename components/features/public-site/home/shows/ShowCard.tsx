import Image from "next/image";
import Link from "next/link";
import { Play, Ticket, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Show } from "./types";

type BadgeVariant = "default" | "destructive" | "secondary" | "outline" | "gold";

const BADGE_VARIANT_MAP: Record<string, BadgeVariant> = {
  theatre: "default",
  rencontre: "destructive",
  photographie: "gold",
  "exposition photo": "gold",
  exposition: "gold",
  photo: "gold",
};

function getBadgeVariant(type: string): BadgeVariant {
  const normalized = type
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return BADGE_VARIANT_MAP[normalized] ?? "secondary";
}

interface ShowCardProps {
  show: Show;
  index: number;
}

export function ShowCard({ show, index }: ShowCardProps) {
  const spectacleUrl = `/spectacles/${show.slug}`;
  const sortedDates = show.dates ? [...show.dates].sort() : [];
  const formatShort = (d: string) => {
    try {
      return format(parseISO(d.replace(" ", "T")), "dd/MM/yy", { locale: fr });
    } catch {
      return null;
    }
  };
  const firstFormatted = sortedDates.length > 0 ? formatShort(sortedDates[0]) : null;
  const lastFormatted =
    sortedDates.length > 0 ? formatShort(sortedDates[sortedDates.length - 1]) : null;
  const datePeriodLabel =
    !firstFormatted || !lastFormatted
      ? null
      : firstFormatted === lastFormatted
        ? `Le ${firstFormatted}`
        : `${firstFormatted} → ${lastFormatted}`;

  return (
    <div
      className="card-hover hover:bg-card animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
        <Link href={spectacleUrl} className="block absolute inset-0 z-0">
          <Image
            src={show.image}
            alt={show.image ? `Affiche du spectacle ${show.title}` : `Image par défaut – affiche non disponible pour ${show.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Hover overlay — outside the image Link to avoid nested anchors */}
        {/* pointer-events-none kept for mouse (so image link stays clickable when invisible) */}
        {/* group-focus-within:pointer-events-auto enables click when keyboard-focused */}
        <div className="absolute inset-0 z-10 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
          <div className="flex flex-col gap-3 px-6 w-full">
            {show.ticketUrl && (
              <Link
                href={show.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Réserver des billets pour ${show.title} (s'ouvre dans un nouvel onglet)`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground w-full hover:bg-chart-6 hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:outline-none"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Je réserve mes billets
              </Link>
            )}
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
          <Badge variant={getBadgeVariant(show.genre)}>{show.genre}</Badge>
        )}
        <Badge variant="outlineGold" className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {datePeriodLabel ?? "Dates à venir"}
        </Badge>
      </div>

      {/* Titre */}
      <div className="py-3 text-center">
        <h3 className="text-2xl font-bold text-foreground line-clamp-2 px-1 leading-tight">
          <Link href={spectacleUrl}>{show.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 px-2">
          {show.short_description}
        </p>
      </div>
    </div>
  );
}

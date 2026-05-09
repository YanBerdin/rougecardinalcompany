"use client";

/**
 * @file AgendaEventList
 * @description Event list + event card compound components.
 * Layout: [Date block] | [separator] | [badges + title + poster + meta] | [actions]
 * Uses AgendaContext for events and calendar download action.
 */

import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Download, Info, Ticket, X } from "lucide-react";
import { isWithinInterval, parseISO, startOfDay, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgendaContext } from "./AgendaContext";
import { formatEventPeriod } from "./formatPeriod";
import type { Event } from "@/lib/schemas/agenda";
import { buildGoogleMapsUrl } from "@/lib/utils/google-maps";

// ============================================================================
// Constants
// ============================================================================

const ANIMATION_DELAY_STEP = 0.05;

function extractPostalCity(address: string): string {
    const match = address.match(/(\d{5})\s+([^,]+)/);
    if (!match) return "";
    return `${match[1]} ${match[2].trim().toUpperCase()}`;
}

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

// ============================================================================
// Internal Sub-Components (not exported)
// ============================================================================

/** Bloc date : grand chiffre du jour + mois abrégé en majuscules */
function EventCardDateBlock({ date }: { readonly date: string }): React.JSX.Element {
    const d = new Date(`${date}T00:00:00`);
    const day = d.getDate();
    const month = d
        .toLocaleDateString("fr-FR", { month: "short" })
        .toUpperCase()
        .replace(".", "");
    return (
        <div
            className="flex flex-col items-center justify-center w-14 md:w-16 flex-shrink-0"
            aria-hidden="true"
        >
            <span className="text-4xl md:text-5xl font-bold leading-none text-gold tabular-nums">
                {day}
            </span>
            <span className="text-[10px] md:text-xs tracking-[0.18em] uppercase text-muted-foreground mt-1 font-semibold">
                {month}
            </span>
        </div>
    );
}

/** Affiche réduite du spectacle */
function EventCardImage({ image, title, isFirst }: {
    readonly image: string;
    readonly title: string;
    readonly isFirst?: boolean;
}): React.JSX.Element {
    return (
        <div className="relative overflow-hidden flex-shrink-0 rounded-lg shadow-lg shadow-black/40 dark:shadow-black/60 bg-zinc-950 w-16 sm:w-20 md:w-[88px] aspect-[2/3]">
            <Image
                src={image}
                alt={`Visuel de ${title}`}
                className="object-cover"
                fill
                priority={isFirst}
                sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 88px"
            />
        </div>
    );
}

/** Titre avec lien spectacle si disponible */
function EventCardTitle({ event }: { readonly event: Event }): React.JSX.Element {
    const spanClass =
        "text-card-foreground rounded-sm px-1 -mx-1 transition-colors duration-300 group-hover/title:text-chart-2";

    if (event.spectacleSlug) {
        return (
            <h2 className="group/title text-xl md:text-xl lg:text-2xl font-bold leading-snug">
                <Link
                    href={`/spectacles/${event.spectacleSlug}`}
                    className="inline-flex"
                >
                    <span className={spanClass}>{event.title}</span>
                </Link>
            </h2>
        );
    }
    return (
        <h2 className="group/title text-xl md:text-xl lg:text-2xl font-bold leading-snug">
            <span className={`${spanClass} inline-block`}>{event.title}</span>
        </h2>
    );
}

/** Méta compacte sur une ligne : heure · lieu · ville */
function buildVenueLabel(venue: string, address: string): string {
    const city = extractPostalCity(address);
    if (!city) return venue;
    const cityName = city.replace(/^\d{5}\s+/, "").trim().toLowerCase();
    const venueLower = venue.toLowerCase().trim();
    // Only suppress city if venue name explicitly ends with the city name
    // (e.g. "Théâtre de Lyon" → avoids "75017 PARIS" for "Centre Paris anim' La Jonquière")
    if (cityName && venueLower.endsWith(cityName)) return venue;
    return `${venue}, ${city}`;
}

function EventCardMetaInline({ event }: { readonly event: Event }): React.JSX.Element {
    const mapsUrl = buildGoogleMapsUrl({ name: event.venue, address: event.address });
    const venueLabel = buildVenueLabel(event.venue, event.address);
    return (
        <div
            className="flex flex-col items-start gap-x-3 gap-y-2 text-xs md:text-sm text-muted-foreground"
            aria-label="Informations pratiques"
        >
            <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gold shrink-0" aria-hidden="true" />
                {formatEventPeriod(event)}
            </span>

            {mapsUrl ? (
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir ${venueLabel} sur Google Maps (nouvel onglet)`}
                    title="Voir sur Google Maps"
                    className="flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                    <MapPin className="h-3 w-3 text-gold shrink-0" aria-hidden="true" />
                    <span>{venueLabel}</span>
                </a>
            ) : (
                <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold shrink-0" aria-hidden="true" />
                    {venueLabel}
                </span>
            )}
        </div>
    );
}

/** 3 boutons d'action : Réserver, Calendrier, Infos pratiques */
function EventCardActions({ event, compact = false }: { readonly event: Event; readonly compact?: boolean }): React.JSX.Element {
    const { actions } = useAgendaContext();
    const types = event.genres.length > 0 ? event.genres : ["Spectacle"];
    const ticketLabel = types.includes("Atelier") ? "M'inscrire" : "Réserver mes billets";
    const size = compact ? "sm" : "default";
    const placeholderClass = compact ? "h-0" : "h-9";

    return (
        <div className="flex flex-col gap-2 w-full">
            {event.ticketUrl ? (
                <Button variant="default" size={size} className="w-full" asChild>
                    <Link
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${ticketLabel} — ${event.title}`}
                    >
                        <Ticket className="mr-2 h-4 w-4" aria-hidden="true" />
                        {ticketLabel}
                    </Link>
                </Button>
            ) : (
                <div className={placeholderClass} aria-hidden="true" />
            )}
            <Button
                variant="secondary"
                size={size}
                className="w-full"
                aria-label={`Ajouter ${event.title} au calendrier`}
                onClick={() => actions.downloadCalendarFile(event)}
            >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter au calendrier
            </Button>
            <Button variant="outline" size={size} className="w-full" asChild>
                <Link href={`/agenda/${event.id}`} aria-label={`Informations pratiques — ${event.title}`}>
                    <Info className="mr-2 h-4 w-4" aria-hidden="true" />
                    Infos pratiques
                </Link>
            </Button>
        </div>
    );
}

function resolveDisplayDate(event: Event, selectedDate: Date | null): string {
    if (!selectedDate) return event.date;
    try {
        const target = startOfDay(selectedDate);
        const start = startOfDay(parseISO(event.date));
        const end = event.endDate ? startOfDay(parseISO(event.endDate)) : start;
        if (isWithinInterval(target, { start, end })) return format(selectedDate, "yyyy-MM-dd");
    } catch {
        // fallback to event.date
    }
    return event.date;
}

function EventCardMobileLayout({ event, day, month, animationDelay }: {
    readonly event: Event;
    readonly day: number;
    readonly month: string;
    readonly animationDelay: number;
}): React.JSX.Element {
    return (
        <div className="md:hidden">
            <CardContent className="p-4 flex flex-row items-start gap-3">
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                    <EventCardImage image={event.image} title={event.title} isFirst={animationDelay === 0} />
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-2xl font-bold tabular-nums text-foreground">{day}</span>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-semibold mt-0.5">{month}</span>
                    </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {event.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {event.genres.map((type) => (
                                <Badge key={type} variant={getBadgeVariant(type)}>{type}</Badge>
                            ))}
                        </div>
                    )}
                    <EventCardTitle event={event} />
                    <EventCardMetaInline event={event} />
                    <div className="pt-1"><EventCardActions event={event} compact /></div>
                </div>
            </CardContent>
        </div>
    );
}

function EventCardDesktopLayout({ event, displayDate, animationDelay }: {
    readonly event: Event;
    readonly displayDate: string;
    readonly animationDelay: number;
}): React.JSX.Element {
    return (
        <CardContent className="hidden md:block p-5 lg:p-6">
            <div className="flex flex-row items-stretch">
                <EventCardDateBlock date={displayDate} />
                <div className="w-px bg-border/40 self-stretch mx-4 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {event.genres.length > 0 && (
                        <div className="flex flex-col items-start gap-1.5">
                            {event.genres.map((type) => (
                                <Badge key={type} variant={getBadgeVariant(type)}>{type}</Badge>
                            ))}
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <EventCardTitle event={event} />
                            <EventCardMetaInline event={event} />
                        </div>
                        <EventCardImage image={event.image} title={event.title} isFirst={animationDelay === 0} />
                    </div>
                </div>
                <div className="flex flex-col justify-center flex-shrink-0 w-56 border-l border-border/40 pl-5 ml-4">
                    <EventCardActions event={event} />
                </div>
            </div>
        </CardContent>
    );
}

function AgendaEventCard({ event, animationDelay, selectedDate }: {
    readonly event: Event;
    readonly animationDelay: number;
    readonly selectedDate: Date | null;
}): React.JSX.Element {
    const displayDate = resolveDisplayDate(event, selectedDate);
    const d = new Date(`${displayDate}T00:00:00`);
    const day = d.getDate();
    const month = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase();

    return (
        <div
            className="group relative motion-safe:animate-fade-in-up motion-safe:transition-all motion-safe:duration-500"
            style={{ animationDelay: `${animationDelay}s`, animationFillMode: "both" }}
        >
            <Card className="rounded-2xl bg-card dark:bg-zinc-800/40 border border-white/30 dark:border-white/10 shadow-lg group-hover:border-primary group-hover:shadow-[0_8px_30px_rgba(173,0,0,0.2)] motion-safe:transition-all motion-safe:duration-500 overflow-hidden">
                <EventCardMobileLayout event={event} day={day} month={month} animationDelay={animationDelay} />
                <EventCardDesktopLayout event={event} displayDate={displayDate} animationDelay={animationDelay} />
            </Card>
        </div>
    );
}

// ============================================================================
// Exported Compound Component
// ============================================================================

function SelectedDateBanner({ label, onClear }: {
    readonly label: string;
    readonly onClear: () => void;
}): React.JSX.Element {
    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm text-chart-2 font-medium capitalize">
            <span className="flex-1">{label}</span>
            <button
                type="button"
                onClick={onClear}
                aria-label="Effacer le filtre par date"
                className="p-0.5 rounded hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    );
}

function EventListEmptyState({ selectedDate, onClear }: {
    readonly selectedDate: Date | null;
    readonly onClear: () => void;
}): React.JSX.Element {
    return (
        <div className="flex flex-col gap-3">
            {selectedDate && (
                <SelectedDateBanner
                    label={format(selectedDate, "EEEE d MMMM", { locale: fr })}
                    onClear={onClear}
                />
            )}
            <div className="text-center py-20 px-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm" role="status">
                {selectedDate ? (
                    <>
                        <p className="text-gold text-xl font-light tracking-wide">Aucun événement ce jour.</p>
                        <p className="text-chart-6 mt-2 text-sm">Sélectionnez un autre jour ou supprimez le filtre.</p>
                    </>
                ) : (
                    <>
                        <p className="text-gold text-xl font-light tracking-wide">Aucun événement ne correspond à votre recherche.</p>
                        <p className="text-chart-6 mt-2 text-sm">Essayez de modifier vos filtres ou de revenir plus tard.</p>
                    </>
                )}
            </div>
        </div>
    );
}

export function AgendaEventList(): React.JSX.Element {
    const { state, actions } = useAgendaContext();
    const handleClear = () => actions.setSelectedDate(null);

    const eventsToShow = state.selectedDate
        ? state.filteredEvents.filter((ev) => {
            try {
                const target = startOfDay(state.selectedDate!);
                const start = startOfDay(parseISO(ev.date));
                const end = ev.endDate ? startOfDay(parseISO(ev.endDate)) : start;
                return isWithinInterval(target, { start, end });
            } catch {
                return false;
            }
        })
        : state.filteredEvents;

    const selectedDateLabel = state.selectedDate
        ? format(state.selectedDate, "EEEE d MMMM", { locale: fr })
        : null;

    if (eventsToShow.length === 0) {
        return <EventListEmptyState selectedDate={state.selectedDate} onClear={handleClear} />;
    }

    return (
        <div className="flex flex-col gap-3">
            {selectedDateLabel && (
                <SelectedDateBanner label={selectedDateLabel} onClear={handleClear} />
            )}
            <ul role="list" className="flex flex-col gap-4 md:gap-5 list-none">
                {eventsToShow.map((event, index) => (
                    <li key={event.id} className="transform-gpu">
                        <AgendaEventCard
                            event={event}
                            animationDelay={index * ANIMATION_DELAY_STEP}
                            selectedDate={state.selectedDate}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

"use client";

/**
 * @file AgendaEventList
 * @description Event list + event card compound components.
 * Uses AgendaContext for events and calendar download action.
 * Internal sub-components handle card decomposition (< 30 lines each).
 */

import Image from "next/image";
import Link from "next/link";
import {
    Calendar,
    MapPin,
    Clock,
    Download,
    Info,
    Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgendaContext } from "./AgendaContext";
import type { Event } from "@/lib/schemas/agenda";

// ============================================================================
// Constants
// ============================================================================

const ANIMATION_DELAY_STEP = 0.05;

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractPostalCity(address: string): string {
    const match = address.match(/(\d{5})\s+(.+)/);
    if (!match) return address.toUpperCase();
    return `${match[1]} ${match[2].toUpperCase()}`;
}

// Map specialized badge variants to emphasize the "gold" theater aesthetic
const BADGE_VARIANT_MAP: Record<string, "default" | "destructive" | "secondary" | "outline" | "gold"> = {
    Théâtre: "default",
    Rencontre: "destructive",
    Photographie: "secondary",
};

// ============================================================================
// Internal Sub-Components (not exported)
// ============================================================================

function EventCardImage({ image, title, isFirst }: {
    readonly image: string;
    readonly title: string;
    readonly isFirst?: boolean;
}): React.JSX.Element {
    return (
        <div className="relative overflow-hidden flex-shrink-0 rounded-xl shadow-xl shadow-black/50 dark:shadow-black/70 bg-zinc-950 w-28 sm:w-32 md:w-40 lg:w-40 aspect-[2/3]">
            <Image
                src={image}
                alt={`Visuel de ${title}`}
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:brightness-105"
                fill
                priority={isFirst}
                sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 160px"
            />
        </div>
    );
}

function EventCardTitle({ event }: { readonly event: Event }): React.JSX.Element {
    if (event.spectacleSlug) {
        return (
            <h2 className="group/title">
                <Link
                    href={`/spectacles/${event.spectacleSlug}`}
                    className="inline-flex items-start gap-2 text-2xl md:text-3xl xl:text-4xl font-bold leading-tight transition-all duration-300"
                >
                    <span className="text-gold-gradient relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-300 after:ease-out group-hover/title:after:w-full">{event.title}</span>
                </Link>
            </h2>
        );
    }
    return (
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight transition-all duration-300">
            <span className="text-gold-gradient inline-block relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-300 after:ease-out hover:after:w-full">{event.title}</span>
        </h2>
    );
}

function EventCardMeta({ event }: { readonly event: Event }): React.JSX.Element {
    const formattedDate = new Date(event.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="space-y-4 text-foreground">
            <div className="flex items-center group/meta">
                <div className="p-2 rounded-full bg-gold/10 mr-4 transition-colors group-hover/meta:bg-gold/20">
                    <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
                </div>
                <span className="text-xs md:text-base font-medium tracking-wide text-foreground">{capitalizeFirst(formattedDate)}</span>
            </div>
            <div className="flex items-center group/meta">
                <div className="p-2 rounded-full bg-gold/10 mr-4 transition-colors group-hover/meta:bg-gold/20">
                    <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
                </div>
                <span className="text-xs md:text-base tracking-wide text-foreground">{event.time}</span>
            </div>
            <div className="flex items-start group/meta">
                <div className="p-2 rounded-full bg-gold/10 mr-4 transition-colors group-hover/meta:bg-gold/20">
                    <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
                </div>
                <div>
                    <div className="text-xs md:text-base font-medium text-foreground">{event.venue}</div>
                    <div className="text-xs md:text-sm opacity-70">{extractPostalCity(event.address)}</div>
                </div>
            </div>
        </div>
    );
}

function EventCardActions({ event }: { readonly event: Event }): React.JSX.Element {
    const { actions } = useAgendaContext();
    const types = event.genres.length > 0 ? event.genres : ["Spectacle"];
    const ticketLabel = types.includes("Atelier") ? "M'inscrire" : "Réserver mes billets";

    return (
        <div className="flex flex-col gap-3">
            {/* CTA principal — pleine largeur, poids visuel maximal */}
            {event.ticketUrl ? (
                <Button variant="default" size="default" className="w-full" asChild>
                    <Link href={event.ticketUrl} target="_blank" rel="noopener noreferrer" aria-label={`${ticketLabel} — ${event.title}`}>
                        <Ticket className="mr-2 h-4 w-4" aria-hidden="true" />
                        {ticketLabel}
                    </Link>
                </Button>
            ) : (
                <div className="h-9" aria-hidden="true" />
            )}
            {/* Actions secondaires — grille 2 colonnes compacte */}
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="secondary"
                    size="default"
                    className="w-full"
                    aria-label={`Ajouter ${event.title} au calendrier`}
                    onClick={() => actions.downloadCalendarFile(event)}
                >
                    <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Calendrier
                </Button>
                <Button variant="outline" size="default" className="w-full" asChild>
                    <Link href={`/agenda/${event.id}`} aria-label={`Voir les détails — ${event.title}`}>
                        <Info className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Voir les détails
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function AgendaEventCard({ event, animationDelay }: {
    readonly event: Event;
    readonly animationDelay: number;
}): React.JSX.Element {
    return (
        <div
            className="group relative motion-safe:animate-fade-in-up motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:-translate-y-1 h-full"
            style={{ animationDelay: `${animationDelay}s`, animationFillMode: "both" }}
        >
            <Card className="rounded-2xl bg-card dark:bg-zinc-800/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl group-hover:border-primary group-hover:shadow-[0_15px_40px_rgba(173,0,0,0.25)] motion-safe:transition-all motion-safe:duration-500 h-full">
                <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col gap-6 h-full">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {event.genres.map((type) => (
                            <Badge key={type} variant={BADGE_VARIANT_MAP[type] ?? "secondary"}>
                                {type}
                            </Badge>
                        ))}
                    </div>
                    {/* Titre */}
                    <EventCardTitle event={event} />
                    {/* Affiche + Méta côte à côte */}
                    <div className="flex flex-row gap-4 md:gap-6 items-start">
                        <div className="flex-1">
                            <EventCardMeta event={event} />
                        </div>
                        <EventCardImage
                            image={event.image}
                            title={event.title}
                            isFirst={animationDelay === 0}
                        />
                    </div>
                    <div className="mt-auto">
                        <EventCardActions event={event} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================================
// Exported Compound Component
// ============================================================================

export function AgendaEventList(): React.JSX.Element {
    const { state } = useAgendaContext();

    if (state.filteredEvents.length === 0) {
        return (
            <div className="text-center py-20 px-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm" role="status">
                <p className="text-gold text-xl font-light tracking-wide">
                    Aucun événement ne correspond à votre recherche.
                </p>
                <p className="text-chart-6 mt-2 text-sm">
                    Essayez de modifier vos filtres ou de revenir plus tard.
                </p>
            </div>
        );
    }

    const isOddCount = state.filteredEvents.length % 2 !== 0;
    return (
        <ul role="list" className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 list-none perspective-1000">
            {state.filteredEvents.map((event, index) => {
                const isLastAlone = isOddCount && index === state.filteredEvents.length - 1;
                return (
                    <li key={event.id} className={`transform-gpu h-full${isLastAlone ? " lg:col-span-2 lg:w-1/2 lg:mx-auto" : ""}`}>
                        <AgendaEventCard
                            event={event}
                            animationDelay={index * ANIMATION_DELAY_STEP}
                        />
                    </li>
                );
            })}
        </ul>
    );
}

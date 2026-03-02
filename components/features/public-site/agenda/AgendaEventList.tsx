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
    ExternalLink,
    Download,
    Info,
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

const BADGE_VARIANT_MAP: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    Spectacle: "default",
    "Première": "destructive",
    Rencontre: "secondary",
};

// ============================================================================
// Internal Sub-Components (not exported)
// ============================================================================

function EventCardImage({ image, type, title }: {
    readonly image: string;
    readonly type: string;
    readonly title: string;
}): React.JSX.Element {
    return (
        <div className="relative h-32 md:h-full w-full">
            <Image
                src={image}
                alt={`Visuel de ${title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute top-2 left-2">
                <Badge variant={BADGE_VARIANT_MAP[type] ?? "outline"}>
                    {type}
                </Badge>
            </div>
        </div>
    );
}

function EventCardTitle({ event }: { readonly event: Event }): React.JSX.Element {
    if (event.spectacleSlug) {
        return (
            <Link
                href={`/spectacles/${event.spectacleSlug}`}
                className="text-xl font-bold hover:text-primary transition-colors card-title group"
            >
                {event.title}
                <ExternalLink
                    className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                />
            </Link>
        );
    }
    return <h2 className="text-xl font-bold card-title">{event.title}</h2>;
}

function EventCardMeta({ event }: { readonly event: Event }): React.JSX.Element {
    const formattedDate = new Date(event.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="space-y-3 card-meta">
            <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-3 text-primary" aria-hidden="true" />
                <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center">
                <Clock className="h-4 w-4 mr-3 text-primary" aria-hidden="true" />
                <span>{event.time}</span>
            </div>
            <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 text-primary mt-0.5" aria-hidden="true" />
                <div>
                    <div className="font-medium">{event.venue}</div>
                    <div className="text-sm">{event.address}</div>
                </div>
            </div>
        </div>
    );
}

function EventCardActions({ event }: { readonly event: Event }): React.JSX.Element {
    const { actions } = useAgendaContext();
    const ticketLabel = event.type === "Atelier" ? "S'inscrire" : "Réserver";

    return (
        <div className="flex flex-col justify-center space-y-3">
            {event.ticketUrl && (
                <Button variant="default" asChild>
                    <Link href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        {ticketLabel}
                    </Link>
                </Button>
            )}
            <Button
                variant="secondary"
                onClick={() => actions.downloadCalendarFile(event)}
            >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter au calendrier
            </Button>
            <Button variant="outline" asChild>
                <Link href={`/agenda/${event.id}`}>
                    <Info className="mr-2 h-4 w-4" aria-hidden="true" />
                    Détails de l&apos;événement
                </Link>
            </Button>
        </div>
    );
}

function AgendaEventCard({ event, animationDelay }: {
    readonly event: Event;
    readonly animationDelay: number;
}): React.JSX.Element {
    return (
        <Card
            className="card-hover animate-fade-in-up overflow-hidden"
            style={{ animationDelay: `${animationDelay}s` }}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
                <EventCardImage image={event.image} type={event.type} title={event.title} />
                <CardContent className="md:col-span-3 lg:col-span-4 p-6 bg-card">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-4">
                                <EventCardTitle event={event} />
                                <Badge variant="outline" className="text-md h-6 p-4">
                                    {event.type}
                                </Badge>
                            </div>
                            <EventCardMeta event={event} />
                        </div>
                        <EventCardActions event={event} />
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

// ============================================================================
// Exported Compound Component
// ============================================================================

export function AgendaEventList(): React.JSX.Element {
    const { state } = useAgendaContext();

    if (state.filteredEvents.length === 0) {
        return (
            <div className="text-center py-12" role="status">
                <p className="text-muted-foreground text-lg">
                    Aucun événement trouvé pour ce filtre.
                </p>
            </div>
        );
    }

    return (
        <ul role="list" className="space-y-6 list-none">
            {state.filteredEvents.map((event, index) => (
                <li key={event.id}>
                    <AgendaEventCard
                        event={event}
                        animationDelay={index * ANIMATION_DELAY_STEP}
                    />
                </li>
            ))}
        </ul>
    );
}

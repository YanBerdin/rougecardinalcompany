"use client";

import React from "react";
import Link from "next/link";
import { Ticket, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpectacleCTABarProps {
    title: string;
    ticketUrl?: string | null;
    agendaLabel?: string;
    // backLabel?: string;
    wrapperClassName?: string;
}

/**
 * Barre d'actions principale pour une page de spectacle.
 * Regroupe les actions : Réserver, Consulter l'agenda, Retour à la liste.
 */
export function SpectacleCTABar({
    title,
    ticketUrl,
    agendaLabel = "Agenda",
    // backLabel = "Retour",
    wrapperClassName = "",
}: SpectacleCTABarProps): React.ReactNode {
    return (
        <div className={`flex flex-col sm:flex-row flex-wrap gap-3 ${wrapperClassName}`}>
            {ticketUrl && (
                <Button
                    variant="default"
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-all touch-action-manipulation w-full sm:w-auto"
                    asChild
                >
                    <Link
                        href={ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Réserver mes billets des places pour ${title} (s'ouvre dans un nouvel onglet)`}
                    >
                        <Ticket className="mr-2 h-4 w-4" aria-hidden="true" /> Réserver mes billets
                    </Link>
                </Button>
            )}

            <Button
                variant={ticketUrl ? "secondary" : "default"}
                size="default"
                className="w-full sm:w-auto"
                asChild
            >
                <Link href="/agenda" aria-label="Consulter l'agenda des représentations">
                    <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                    {agendaLabel}
                </Link>
            </Button>
            {/*
            <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto max-sm:hidden"
                asChild
            >
                <Link
                    href="/spectacles"
                    aria-label="Retourner à la page listant tous les évènements"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                     {backLabel} 
                </Link>
            </Button>
            */}
        </div>
    );
}

"use client";

import Link from "next/link";
import { Ticket, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpectacleCTABarProps {
    title: string;
    ticketUrl?: string | null;
    agendaLabel?: string;
    backLabel?: string;
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
    backLabel = "Retour",
    wrapperClassName = "",
}: SpectacleCTABarProps) {
    return (
        <div className={`flex flex-col sm:flex-row flex-wrap gap-3 ${wrapperClassName}`}>
            <Button
                variant="default"
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all touch-action-manipulation w-full sm:w-auto"
                asChild
            >
                <Link
                    href={ticketUrl ?? "/contact?subject=reservation"}
                    aria-label={`Réserver mes billets des places pour ${title}`}
                    {...(ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                    <Ticket className="mr-2 h-4 w-4" aria-hidden="true" /> Réserver mes billets
                </Link>
            </Button>

            <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                asChild
            >
                <Link href="/agenda" aria-label="Consulter l'agenda des représentations">
                    <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                    {agendaLabel}
                </Link>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                asChild
            >
                <Link
                    href="/spectacles"
                    aria-label="Retourner à la page listant tous les spectacles"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    {backLabel}
                </Link>
            </Button>
        </div>
    );
}

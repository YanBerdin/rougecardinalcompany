"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteEventAction } from "@/app/(admin)/admin/agenda/actions-client";
import { EventsTable } from "./EventsTable";
import type { EventSortField, EventSortState } from "./EventsTable";
import { sortEvents, getNextSortState } from "@/lib/tables/event-table-helpers";

// Type Client (BigInt → Number pour sérialisation JSON)
type EventClientDTO = {
    id: number;
    spectacle_id: number;
    spectacle_titre?: string;
    lieu_id: number | null;
    lieu_nom?: string;
    lieu_ville?: string;
    date_debut: string;
    date_fin: string | null;
    start_time: string;
    end_time: string | null;
    status: "scheduled" | "cancelled" | "completed";
    ticket_url: string | null;
    capacity: number | null;
    price_cents: number | null;
    created_at: string;
    updated_at: string;
};

interface EventsViewProps {
    initialEvents: EventClientDTO[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
    const router = useRouter();
    const [events, setEvents] = useState(initialEvents);
    const [sortState, setSortState] = useState<EventSortState | null>(null);

    // ✅ CRITIQUE : Sync local state when props change
    useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    // Sort events based on current sort state
    const sortedEvents = useMemo(() => {
        if (!sortState) return events;
        return sortEvents(events, sortState);
    }, [events, sortState]);

    const handleSort = useCallback((field: EventSortField) => {
        setSortState((currentSort) => getNextSortState(currentSort, field));
    }, []);

    const handleDelete = useCallback(
        async (id: number) => {
            if (!confirm("Supprimer cet événement ?")) return;

            try {
                const result = await deleteEventAction(String(id));

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Événement supprimé");
                router.refresh(); // ✅ Déclenche re-fetch Server Component
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur");
            }
        },
        [router]
    );

    const handleEdit = useCallback(
        (id: number) => {
            router.push(`/admin/agenda/${id}/edit`);
        },
        [router]
    );

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-6 lg:mb-12 flex-wrap gap-4">
                <h1 className="text-3xl md:text-4xl font-bold whitespace-nowrap">Gestion Agenda</h1>
                <Button onClick={() => router.push("/admin/agenda/new")}>
                    Nouvel Événement
                </Button>
            </div>
            <EventsTable
                events={sortedEvents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                sortState={sortState}
                onSort={handleSort}
            />
        </div>
    );
}

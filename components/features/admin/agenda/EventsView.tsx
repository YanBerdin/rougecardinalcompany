"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteEventAction } from "@/app/(admin)/admin/agenda/actions-client";
import { EventsTable } from "./EventsTable";
import type { EventSortField, EventSortState } from "./EventsTable";
import { sortEvents, getNextSortState } from "@/lib/tables/event-table-helpers";
import type { EventClientDTO } from "@/lib/types/admin-agenda-client";

interface EventsViewProps {
    initialEvents: EventClientDTO[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
    const router = useRouter();
    const [events, setEvents] = useState(initialEvents);
    const [sortState, setSortState] = useState<EventSortState | null>(null);
    const [eventToDelete, setEventToDelete] = useState<EventClientDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Opens the confirmation dialog
    const handleDelete = useCallback(
        (id: number) => {
            const event = events.find((e) => e.id === id) ?? null;
            setEventToDelete(event);
        },
        [events]
    );

    // Executes the deletion after confirmation
    const handleConfirmDelete = useCallback(async () => {
        if (!eventToDelete) return;
        setIsDeleting(true);

        try {
            const result = await deleteEventAction(String(eventToDelete.id));

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Événement supprimé");
            router.refresh(); // ✅ Déclenche re-fetch Server Component
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsDeleting(false);
            setEventToDelete(null);
        }
    }, [eventToDelete, router]);

    const handleEdit = useCallback(
        (id: number) => {
            router.push(`/admin/agenda/${id}/edit`);
        },
        [router]
    );

    const handleView = useCallback(
        (id: number) => {
            router.push(`/admin/agenda/${id}`);
        },
        [router]
    );

    return (
        <>
        <div className="container py-8">
            <div className="flex justify-between items-center mb-6 lg:mb-12 flex-wrap gap-4">
                <h1 className="text-3xl md:text-4xl font-bold whitespace-nowrap">Gestion Agenda</h1>
                <Button onClick={() => router.push("/admin/agenda/new")}>
                    Nouvel Événement
                </Button>
            </div>
            <EventsTable
                events={sortedEvents}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                sortState={sortState}
                onSort={handleSort}
            />
        </div>

        {/* ── Delete confirmation dialog ── */}
        <AlertDialog
            open={eventToDelete !== null}
            onOpenChange={(open) => { if (!open) setEventToDelete(null); }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {eventToDelete?.spectacle_titre && (
                            <strong className="text-foreground">
                                {eventToDelete.spectacle_titre}
                            </strong>
                        )}
                        {" "}du{" "}
                        {eventToDelete && new Date(eventToDelete.date_debut).toLocaleDateString("fr-FR")}
                        <br />
                        Cette action est irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="bg-destructive/80 text-destructive-foreground hover:bg-red-500/20 hover:text-destructive"
                    >
                        {isDeleting ? "Suppression…" : "Supprimer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

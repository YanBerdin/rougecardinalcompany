"use client";

import { Calendar, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { SortState } from "@/components/ui/sortable-header";
import { getEventStatusBadge } from "@/lib/tables/event-table-helpers";

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

// Sortable fields
export type EventSortField = "spectacle_titre" | "date_debut" | "lieu_nom" | "status";
export type EventSortState = SortState<EventSortField>;

interface EventsTableProps {
    events: EventClientDTO[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    sortState: EventSortState | null;
    onSort: (field: EventSortField) => void;
}

export function EventsTable({ events, onEdit, onDelete, sortState, onSort }: EventsTableProps) {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-card text-muted-foreground">
                Aucun événement trouvé.
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-4">
            {/* 
              MOBILE VIEW (Cards) 
              Visible only on small screens (< 640px)
            */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
                {events.map((event) => (
                    <div
                        key={String(event.id)}
                        className="bg-card rounded-lg border shadow-sm p-4 space-y-4"
                    >
                        {/* Header: Title and Status */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg leading-tight text-foreground">
                                    {event.spectacle_titre}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {getEventStatusBadge(event.status)}
                                </div>
                            </div>
                        </div>

                        {/* Body: Meta data */}
                        <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 col-span-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{event.start_time.slice(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                    {event.lieu_nom ?? "-"}
                                    {event.lieu_ville && ` · ${event.lieu_ville}`}
                                </span>
                            </div>
                        </div>

                        {/* Footer: Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onEdit(event.id)}
                                className="h-10 min-w-[56px] px-3"
                                aria-label={`Modifier ${event.spectacle_titre}`}
                            >
                                <Pencil className="h-5 w-5 mr-2" /> Modifier
                            </Button>
                            <Button
                                variant="ghost-destructive"
                                size="sm"
                                onClick={() => onDelete(event.id)}
                                className="h-10 min-w-[56px] px-3"
                                aria-label={`Supprimer ${event.spectacle_titre}`}
                            >
                                <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 
              DESKTOP VIEW (Table) 
              Visible only on larger screens (>= 640px)
            */}
            <div className="hidden sm:block rounded-md bg-card border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/80">
                            <TableHead>
                                <SortableHeader
                                    field="spectacle_titre"
                                    label="Spectacle"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>
                                <SortableHeader
                                    field="date_debut"
                                    label="Date"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>
                                <SortableHeader
                                    field="lieu_nom"
                                    label="Lieu"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>
                                <SortableHeader
                                    field="status"
                                    label="Statut"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={String(event.id)}>
                                <TableCell className="font-medium">
                                    {event.spectacle_titre}
                                </TableCell>
                                <TableCell>
                                    {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                                    <br />
                                    <span className="text-sm text-muted-foreground">
                                        {event.start_time.slice(0, 5)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {event.lieu_nom ?? "-"}
                                    {event.lieu_ville && (
                                        <span className="text-sm text-muted-foreground block">
                                            {event.lieu_ville}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{getEventStatusBadge(event.status)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(event.id)}
                                            title="Modifier"
                                            className="h-8 w-8 sm:h-9 sm:w-9"
                                            aria-label={`Modifier ${event.spectacle_titre}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost-destructive"
                                            size="icon"
                                            onClick={() => onDelete(event.id)}
                                            title="Supprimer"
                                            className="h-8 w-8 sm:h-9 sm:w-9"
                                            aria-label={`Supprimer ${event.spectacle_titre}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

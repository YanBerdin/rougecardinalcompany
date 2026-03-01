"use client";

/**
 * @file AgendaFilters
 * @description Filter section compound component.
 * Reads eventTypes and filterType from AgendaContext.
 */

import { Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAgendaContext } from "./AgendaContext";

export function AgendaFilters(): React.JSX.Element {
    const { state, actions } = useAgendaContext();

    return (
        <div className="flex items-center space-x-4 pb-8">
            <Filter className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
                <label htmlFor="event-type-filter" className="sr-only">
                    Filtrer par type d&apos;événement
                </label>
                <Select
                    value={state.filterType}
                    onValueChange={actions.setFilterType}
                >
                    <SelectTrigger className="w-64 bg-card" aria-label="Filtrer par type d'événement">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {state.eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

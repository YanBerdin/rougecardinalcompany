"use client";

/**
 * @file AgendaFilters
 * @description Vertical filter tabs for event types.
 * Reads eventTypes and filterType from AgendaContext.
 */

import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgendaContext } from "./AgendaContext";

export function AgendaFilters(): React.JSX.Element {
    const { state, actions } = useAgendaContext();

    return (
        <div role="group" aria-label="Filtrer par type d'événement">
            <div className="flex items-center gap-2 mb-3 px-1">
                <Filter className="size-4 text-gold" aria-hidden="true" />
                <span className="font-semibold text-base">Filtres</span>
            </div>
            <ul className="flex flex-col gap-1">
                {state.eventTypes.map((type) => {
                    const isActive = state.filterType === type.value;
                    return (
                        <li key={type.value}>
                            <button
                                type="button"
                                onClick={() => actions.setFilterType(type.value)}
                                aria-pressed={isActive}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-gold/10 text-gold-text border border-gold/30"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {type.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

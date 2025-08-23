"use client";

import { useAgendaData } from './hooks';
import { AgendaView } from './AgendaView';

export function AgendaContainer() {
    // Utilisation du hook personnalisé pour récupérer les données et la logique
    const {
        events,
        eventTypes,
        filterType,
        setFilterType,
        generateCalendarFile,
        loading
    } = useAgendaData();

    // Rendu du composant de présentation avec les données récupérées
    return (
        <AgendaView
            events={events}
            eventTypes={eventTypes}
            filterType={filterType}
            setFilterType={setFilterType}
            generateCalendarFile={generateCalendarFile}
            loading={loading}
        />
    );
}

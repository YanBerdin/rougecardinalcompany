/**
 * [DEPRECATED MOCK] — Agenda hooks (mocks)
 *
 * Cette implémentation client avec données simulées a été remplacée par
 * une lecture via DAL côté serveur (Supabase) + Server Components.
 *
 * Conservée à titre documentaire pendant la période de transition.
 * TODO: supprimer quand l’Agenda sera entièrement validé en prod.
 */

/*
import { useState, useEffect } from 'react';
import { Event, EventType } from './types';

// Mock des événements 
// == 07_table_evenements
const eventsData: Event[] = [
    {
        id: 1,
        title: "Les Murmures du Temps",
        date: "2024-02-15",
        time: "20h30",
        venue: "Théâtre de la Ville",
        address: "2 Place du Châtelet, 75004 Paris", // adress + zip_code + city
        type: "Spectacle",
        status: "Bientôt complet",
        ticketUrl: "https://billetterie.theatredelaville.com",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
        id: 2,
        title: "Fragments d'Éternité - Première",
        date: "2024-02-28",
        time: "19h00",
        venue: "Théâtre des Abbesses",
        address: "31 Rue des Abbesses, 75018 Paris",
        type: "Première",
        status: "Disponible",
        ticketUrl: "https://billetterie.theatredesabbesses.com",
        image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
        id: 3,
        title: "Rencontre avec l'équipe artistique",
        date: "2024-03-05",
        time: "18h00",
        venue: "Librairie Théâtrale",
        address: "12 Rue Saint-André des Arts, 75006 Paris",
        type: "Rencontre",
        status: "Gratuit",
        ticketUrl: null,
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
        id: 4,
        title: "La Danse des Ombres",
        date: "2024-03-12",
        time: "20h00",
        venue: "Centre Culturel André Malraux",
        address: "Place André Malraux, 69000 Lyon",
        type: "Spectacle",
        status: "Tournée",
        ticketUrl: "https://billetterie.malraux-lyon.com",
        image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
        id: 5,
        title: "Atelier théâtre jeune public",
        date: "2024-03-20",
        time: "14h00",
        venue: "Maison des Arts",
        address: "Place des Arts, 75011 Paris",
        type: "Atelier",
        status: "Inscription requise",
        ticketUrl: "mailto:ateliers@rouge-cardinal.fr",
        image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
        id: 6,
        title: "Les Murmures du Temps",
        date: "2024-03-25",
        time: "15h00",
        venue: "Théâtre Municipal",
        address: "Avenue de la République, 13100 Aix-en-Provence",
        type: "Spectacle",
        status: "Matinée",
        ticketUrl: "https://billetterie.theatre-aix.com",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
];

// Données des types d'événements
const eventTypesData: EventType[] = [
    { value: "all", label: "Tous les événements" },
    { value: "Spectacle", label: "Spectacles" },
    { value: "Première", label: "Premières" },
    { value: "Rencontre", label: "Rencontres" },
    { value: "Atelier", label: "Ateliers" }
];

// Hook personnalisé pour la gestion des événements de l'agenda
export const useAgendaData = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [filterType, setFilterType] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulation appel API avec un délai (skeleton)
        // https://supabase.com/docs/reference/javascript/db-abortsignal
        const fetchData = async () => {//TODO: remove
            try {
                // Temps de chargement simulé
                await new Promise(resolve => setTimeout(resolve, 1200));
                
                // Mise à jour des données (à terme, appel API)
                setEvents(eventsData);
                setEventTypes(eventTypesData);
            } catch (error) {
                console.error("Erreur lors du chargement des événements:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtre les événements en fonction du type sélectionné
    const filteredEvents = events.filter(event =>
        filterType === "all" || event.type === filterType
    );

    // Fonction pour générer un fichier de calendrier (.ics)
    const generateCalendarFile = (event: Event) => {
        const startDate = new Date(`${event.date}T${event.time.replace('h', ':')}`);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2h

        const formatDate = (date: Date) =>
            date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Rouge-Cardinal//FR',
            'BEGIN:VEVENT',
            `UID:${event.id}@rouge-cardinal.fr`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${formatDate(startDate)}`,
            `DTEND:${formatDate(endDate)}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.title} - Compagnie Rouge-Cardinal`,
            `LOCATION:${event.venue}, ${event.address}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return {
        events: filteredEvents,
        eventTypes,
        filterType,
        setFilterType,
        generateCalendarFile,
        loading
    };
};
*/


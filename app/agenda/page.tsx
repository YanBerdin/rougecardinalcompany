import { Metadata } from 'next';
import { AgendaContainer } from '@/components/features/public-site/agenda/AgendaContainer';

export const metadata: Metadata = {
    title: 'Agenda | Rouge-Cardinal',
    description: 'Retrouvez tous les événements, spectacles et ateliers de la compagnie Rouge-Cardinal.',
};

export default function AgendaPage() {
    return <AgendaContainer />;
}
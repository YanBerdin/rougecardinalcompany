import { Metadata } from 'next';
import { SpectaclesContainer } from '@/components/features/public-site/spectacles/SpectaclesContainer';

export const metadata: Metadata = {
    title: 'Spectacles | Rouge-Cardinal',
    description: 'Découvrez tous les spectacles de la compagnie Rouge-Cardinal, créations actuelles et archives.',
};

export default function SpectaclesPage() {
    return <SpectaclesContainer />;
}
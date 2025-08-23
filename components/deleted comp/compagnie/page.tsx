import { Metadata } from 'next';
import { CompagnieContainer } from '@/components/features/public-site/compagnie/CompagnieContainer';

export const metadata: Metadata = {
  title: 'Notre Compagnie | Rouge-Cardinal',
  description: 'Découvrez l\'histoire, les valeurs et l\'équipe de la compagnie théâtrale Rouge-Cardinal.',
};

export default function CompagniePage() {
  return <CompagnieContainer />;
}

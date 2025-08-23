import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La Compagnie | Rouge-Cardinal',
  description: 'Découvrez l\'histoire, la mission et l\'équipe de la compagnie de théâtre Rouge-Cardinal.',
};

export default function CompagnieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { HeroContainer } from '@/components/features/public-site/home/HeroContainer';

/**
 * @deprecated Ce composant a été refactorisé selon l'architecture Feature-Based.
 * Utilisez plutôt HeroContainer de '@/components/features/public-site/HeroContainer'.
 */
export function Hero() {
  return <HeroContainer />;
}
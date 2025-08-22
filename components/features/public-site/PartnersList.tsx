"use client";

import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Partner, PartnersListProps } from './types';
import { PartnersSkeleton } from '@/components/skeletons/partners-skeleton';

// Composant pour afficher un partenaire individuel
function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  return (
    <Card
      key={partner.id}
      className="card-hover animate-fade-in-up group cursor-pointer transition-all duration-300 hover:shadow-xl"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-6 text-center h-full flex flex-col justify-between">
        <div>
          <div className="relative mb-4 overflow-hidden rounded-lg">
            <div className="h-16 flex items-center justify-center bg-white/5 dark:bg-white/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
              <img
                src={partner.logo}
                alt={`Logo ${partner.name}`}
                className="max-h-12 max-w-full object-contain filter brightness-0 dark:brightness-100 dark:invert-0 group-hover:brightness-100 transition-all duration-300"
                onError={(e) => {
                  // Fallback si le logo ne charge pas
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold text-lg';
                  fallback.textContent = partner.name.charAt(0);
                  target.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
            {partner.name}
          </h3>

          <p className="text-xs text-primary font-medium mb-2">
            {partner.type}
          </p>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {partner.description}
          </p>
        </div>

        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ExternalLink className="h-4 w-4 mx-auto text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

// Composant de message de remerciement
function ThankYouMessage() {
  return (
    <div className="text-center">
      <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4 text-primary">
          Un Grand Merci
        </h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Grâce au soutien de nos partenaires, nous pouvons continuer à créer,
          innover et partager notre passion pour les arts de la scène.
          Leur confiance nous permet de développer des projets ambitieux
          et de toucher un public toujours plus large.
        </p>
      </div>
    </div>
  );
}

// Composant principal Partners (Dumb)
export function PartnersList({ partners, isLoading }: PartnersListProps) {
  if (isLoading) {
    return <PartnersSkeleton />;
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Nos Partenaires</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ils nous accompagnent et soutiennent notre démarche artistique
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {partners.map((partner, index) => (
            <PartnerCard key={partner.id} partner={partner} index={index} />
          ))}
        </div>

        <ThankYouMessage />
      </div>
    </section>
  );
}

"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Partner, PartnersViewProps } from "./types";
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";
import Image from "next/image";

// Composant pour afficher un partenaire individuel
function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  return (
    <Card
      key={partner.id}
      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/90 border-0 shadow-lg backdrop-blur-sm h-full overflow-hidden"
      style={{
        animationDelay: `${index * 0.1}s`,
        background:
          "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 50%, hsl(var(--card)/0.9) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardContent className="p-6 text-center h-full flex flex-col relative z-10">
        <div className="relative mb-6 overflow-hidden rounded-xl">
          <div className="h-20 flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg border border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
            <Image
              src={partner.logo}
              alt={`Logo ${partner.name}`}
              width={120}
              height={56}
              className="max-h-14 max-w-full object-contain filter contrast-125 transition-all duration-500 group-hover:scale-110 drop-shadow-sm"
              style={{
                filter:
                  "contrast(1.2) brightness(1.1) saturate(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className =
                  "w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg";
                fallback.textContent = partner.name.charAt(0);
                target.parentNode?.appendChild(fallback);
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
        </div>

        <div className="flex-grow flex flex-col justify-center space-y-3">
          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
            {partner.name}
          </h3>

          <div className="inline-flex items-center justify-center">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-105">
              {partner.type}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed px-2 transition-colors duration-300 group-hover:text-foreground/80">
            {partner.description}
          </p>
        </div>

        <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
            <ExternalLink className="h-3 w-3 text-primary-foreground" />
          </div>
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
          innover et partager notre passion pour les arts de la scène. Leur
          confiance nous permet de développer des projets ambitieux et de
          toucher un public toujours plus large.
        </p>
      </div>
    </div>
  );
}

// Composant principal Partners (Dumb)
export function PartnersView({ partners, isLoading }: PartnersViewProps) {
  if (isLoading) {
    return <PartnersSkeleton />;
  }

  return (
    <section className="py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Nos Partenaires</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ils nous accompagnent et soutiennent notre démarche artistique
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(16.666%-1.25rem)] max-w-48"
            >
              <PartnerCard partner={partner} index={index} />
            </div>
          ))}
        </div>

        <ThankYouMessage />
      </div>
    </section>
  );
}

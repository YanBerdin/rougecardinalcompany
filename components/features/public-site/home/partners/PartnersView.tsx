"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Partner, PartnersViewProps } from "./types";
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";
import Image from "next/image";

// Composant pour afficher un partenaire individuel avec effet flip 3D
function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  return (
    <div
      className="group h-80 w-full"
      style={{
        perspective: "1000px",
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out group-hover:[transform:rotateY(180deg)] motion-reduce:group-hover:[transform:none] motion-reduce:transition-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Face avant - Logo et nom */}
        <Card
          className="absolute inset-0 w-full h-full border-2 border-primary/20 shadow-xl"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <CardContent className="p-6 h-full flex flex-col items-center justify-center gap-6 bg-card relative overflow-hidden rounded-2xl">
            {/* Logo container */}
            <div className="relative z-10 w-full flex-shrink-0">
              <div className="h-40 flex items-center justify-center bg-muted/50 rounded-xl p-8 border border-primary/10 shadow-inner">
                <Image
                  src={partner.logo}
                  alt={`Logo ${partner.name}`}
                  width={200}
                  height={120}
                  className="max-h-28 max-w-full object-contain filter contrast-110 brightness-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-28 h-28 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-extrabold text-4xl shadow-lg";
                    fallback.textContent = partner.name.charAt(0);
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            </div>

            {/* Nom du partenaire */}
            <div className="relative z-10 text-center flex-grow flex flex-col justify-center">
              <h3 className="font-extrabold text-lg mb-2 leading-tight tracking-tight text-foreground">
                {partner.name}
              </h3>
              {partner.type && (
                <span className="inline-block text-sm font-semibold text-primary/90 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mt-3">
                  {partner.type}
                </span>
              )}
            </div>

            {/* Indicateur de retournement */}
            <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
              <div className="w-8 h-0.5 bg-primary/30" />
              <span className="tracking-wider uppercase">Découvrir</span>
              <div className="w-8 h-0.5 bg-primary/30" />
            </div>
          </CardContent>
        </Card>

        {/* Face arrière - Description et lien */}
        <Card
          className="absolute inset-0 w-full h-full border-2 border-primary/20 shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <CardContent className="p-6 h-full flex flex-col items-center justify-between bg-primary text-primary-foreground relative overflow-hidden">
            {/* Contenu */}
            <div className="relative z-10 text-center flex-grow flex flex-col justify-center space-y-4">
              <h3 className="font-extrabold text-xl mb-2 leading-tight drop-shadow-md">
                {partner.name}
              </h3>

              {partner.description && (
                <p className="text-sm leading-relaxed text-primary-foreground/90 px-2 max-h-32 overflow-y-auto">
                  {partner.description}
                </p>
              )}
            </div>

            {/* Lien vers le site */}
            {partner.website && partner.website !== "#" && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 border border-white/30 shadow-lg"
              >
                <span>Visiter le site</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Composant de message de remerciement
function ThankYouMessage() {
  return (
    <div className="text-center">
      <div className="relative hero-gradient rounded-3xl p-10 max-w-4xl mx-auto shadow-xl overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-extrabold mb-6 text-white">
            Un Grand Merci
          </h3>
          <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
            Grâce au soutien de nos partenaires, nous pouvons continuer à créer,
            innover et partager notre passion pour les arts de la scène. Leur
            confiance nous permet de développer des projets ambitieux et de
            toucher un public toujours plus large.
          </p>

          {/* Séparateur décoratif */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-0.5 bg-white/30 rounded-full" />
              <div className="w-2 h-2 bg-white/30 rounded-full" />
              <div className="w-12 h-0.5 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
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
    <section className="py-20 relative overflow-hidden bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center mb-16">

          <h2 className="text-5xl font-extrabold mb-6 text-foreground">
            Nos Partenaires
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ils nous accompagnent et soutiennent notre démarche artistique
          </p>

          {/* Élément décoratif */}
          {/* <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>*/}
        </div>

        {/* Grille de partenaires avec effet flip - CENTRÉE */}
        <div className="flex flex-wrap justify-center gap-8 mb-16 max-w-7xl mx-auto">
          {partners.map((partner, index) => (
            <div key={partner.id} className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-64">
              <PartnerCard partner={partner} index={index} />
            </div>
          ))}
        </div>

        {/* Message de remerciement */}
        <ThankYouMessage />
      </div>
    </section>
  );
}


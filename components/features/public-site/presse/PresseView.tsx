"use client";
import { PresseViewProps } from "./types";
import { HeroSection } from "./HeroSection";
import { ContactPresseSection } from "./ContactPresseSection";
import { RevueDePresse } from "./RevueDePresse";
import { CommuniquesSection } from "./CommuniquesSection";
import { AccreditationSection } from "./AccreditationSection";
import { MediaKitSection } from "./MediaKitSection";

/**
 * Composant de présentation (dumb) pour la page Presse
 * Orchestration pure des sous-composants — sans logique métier
 */
export function PresseView({
  pressReleases,
  mediaArticles,
  mediaKit,
}: PresseViewProps) {
  return (
    <div className="pt-12 md:pt-16">
      <HeroSection />
      <ContactPresseSection />
      <RevueDePresse mediaArticles={mediaArticles} />
      <CommuniquesSection pressReleases={pressReleases} />
      <AccreditationSection />
      <MediaKitSection mediaKit={mediaKit} />
    </div>
  );
}

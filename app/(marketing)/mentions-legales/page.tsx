import type { Metadata } from "next";
import {
  LEGAL_CONTENT_STYLES,
  SectionHeading,
} from "@/components/features/public-site/legal/legal-components";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales de la compagnie de théâtre Rouge Cardinal Company.",
  robots: { index: true, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <header className="max-sm:pt-12 pt-16" aria-label="Mentions légales">
        <div className="hero-gradient mx-auto max-sm:py-8 py-10  text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Mentions légales
          </h1>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className={LEGAL_CONTENT_STYLES}>
          <section>
            <SectionHeading>Éditeur du site</SectionHeading>
            <p>
              Le site <strong>rougecardinalcompany.fr</strong> est édité par{" "}
              <strong>Rouge Cardinal Company</strong>, [À REMPLIR : forme juridique]
              au capital de [À REMPLIR : montant] euros, immatriculée au Registre
              du Commerce et des Sociétés de [À REMPLIR : ville] sous le numéro{" "}
              <strong>[À REMPLIR : numéro RCS]</strong>.
            </p>
            <ul className="mt-4">
              <li>
                <strong>Siège social :</strong> [À REMPLIR : adresse complète]
              </li>
              <li>
                <strong>SIRET :</strong> [À REMPLIR : numéro SIRET]
              </li>
              <li>
                <strong>Directeur de la publication :</strong> [À REMPLIR : Prénom Nom]
              </li>
              <li>
                <strong>Contact :</strong>{" "}
                <a href="mailto:contact@rougecardinalcompany.fr">
                  contact@rougecardinalcompany.fr
                </a>
              </li>
            </ul>
          </section>

          <section>
            <SectionHeading>Hébergeur</SectionHeading>
            <p>
              Ce site est hébergé par{" "}
              <strong>[À REMPLIR : nom de l&apos;hébergeur]</strong>, dont le siège
              social est situé au [À REMPLIR : adresse complète hébergeur].
            </p>
          </section>

          <section>
            <SectionHeading>Propriété intellectuelle</SectionHeading>
            <p>
              L&apos;ensemble du contenu de ce site (textes, photographies, vidéos,
              logos, illustrations) est protégé par le droit d&apos;auteur et la
              propriété intellectuelle. Toute reproduction, représentation ou
              diffusion, totale ou partielle, sans autorisation écrite préalable de
              Rouge Cardinal Company est strictement interdite.
            </p>
          </section>

          <hr className="border-border/40" />

          <section>
            <SectionHeading>Données personnelles</SectionHeading>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD)
              et à la loi Informatique et Libertés, vous disposez de droits sur vos
              données personnelles. Pour les exercer, consultez notre{" "}
              <a href="/politique-confidentialite">politique de confidentialité</a>
              {" "}ou contactez-nous à{" "}
              <a href="mailto:privacy@rougecardinalcompany.fr">
                privacy@rougecardinalcompany.fr
              </a>
              .
            </p>
          </section>

          <section>
            <SectionHeading>Cookies</SectionHeading>
            <p>
              Ce site utilise uniquement des cookies strictement nécessaires à son
              fonctionnement et une mesure d&apos;audience interne anonymisée. Aucun
              traceur tiers (Google Analytics, publicité) n&apos;est utilisé. Pour en
              savoir plus, consultez notre{" "}
              <a href="/cookies">politique cookies</a>.
            </p>
          </section>

          <hr className="border-border/40" />

          <section>
            <SectionHeading>Liens hypertextes</SectionHeading>
            <p>
              Ce site peut contenir des liens vers des sites tiers. Rouge Cardinal
              Company n&apos;exerce aucun contrôle sur ces sites et décline toute
              responsabilité quant à leur contenu ou leur politique de
              confidentialité.
            </p>
          </section>
        </div>

        <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border/30">
          Dernière mise à jour : juin 2026
        </p>
      </article>
    </>
  );
}

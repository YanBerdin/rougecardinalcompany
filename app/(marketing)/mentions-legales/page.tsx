import type { Metadata } from "next";
import {
  LEGAL_CONTENT_STYLES,
  SectionHeading,
} from "@/components/features/public-site/legal/legal-components";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales de la compagnie de théâtre Rouge Cardinal.",
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
              Le site <strong>compagnie-rouge-cardinal.fr</strong> est édité par{" "}
              <strong>Rouge Cardinal</strong>, association loi 1901.
            </p>
            <ul className="mt-4">
              <li>
                <strong>Siège social :</strong> Université Sorbonne-Nouvelle, 04 avenue Saint Mandé, 75012, Paris
              </li>
              <li>
                <strong>SIRET :</strong> 93927552500011
              </li>
              <li>
                <strong>Directeur de la publication :</strong> Florian Chaillot
              </li>
              <li>
                <strong>Contact :</strong>{" "}
                <Link
                  className="!text-gold-text hover:!text-gold-light transition-colors"
                  href="mailto:cierougecardinal@gmail.com">
                  cierougecardinal@gmail.com
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <SectionHeading>Hébergeur</SectionHeading>
            <p>
              Ce site est hébergé par{" "}
              <strong>Vercel Inc</strong>, dont le siège
              social est situé au  440 N Barranca Ave PMB 4133, Covina, CA 91723.
            </p>
          </section>

          <section>
            <SectionHeading>Propriété intellectuelle</SectionHeading>
            <p>
              L&apos;ensemble du contenu de ce site (textes, photographies, vidéos,
              logos, illustrations) est protégé par le droit d&apos;auteur et la
              propriété intellectuelle. Toute reproduction, représentation ou
              diffusion, totale ou partielle, sans autorisation écrite préalable de
              Rouge Cardinal est strictement interdite.
            </p>
          </section>

          <hr className="border-border/40" />

          <section>
            <SectionHeading>Données personnelles</SectionHeading>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD)
              et à la loi Informatique et Libertés, vous disposez de droits sur vos
              données personnelles. Pour les exercer, consultez notre{" "}
              <Link href="/politique-confidentialite" className="!text-chart-2 hover:!text-primary">
                politique de confidentialité
              </Link>
              {" "}ou contactez-nous à{" "}
              <Link href="mailto:cie.rougecardinal@gmail.com" className="!text-gold-text hover:!text-gold-light transition-colors">
                cie.rougecardinal@gmail.com
              </Link>
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
              <Link href="/cookies" className="!text-chart-2 hover:!text-primary">politique cookies</Link>.
            </p>
          </section>

          <hr className="border-border/40" />

          <section>
            <SectionHeading>Liens hypertextes</SectionHeading>
            <p>
              Ce site peut contenir des liens vers des sites tiers. Rouge Cardinal n&apos;exerce aucun contrôle sur ces sites et décline toute
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

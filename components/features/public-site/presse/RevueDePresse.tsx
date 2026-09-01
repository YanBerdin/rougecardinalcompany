import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { MediaArticle } from "@/lib/schemas/presse";

interface RevueDePresseSectionProps {
  mediaArticles: MediaArticle[];
}

function formatGazetteDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function RevueDePresse({ mediaArticles }: RevueDePresseSectionProps) {
  if (mediaArticles.length === 0) {
    return null;
  }

  const [featured, ...briefs] = mediaArticles;

  return (
    <section
      aria-label="Revue de presse"
      className="relative overflow-hidden bg-background py-12 text-foreground md:py-28 lg:pt-24 pb-32"
    >
      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Ex-libris / manchette */}
        <header className="mb-14 text-center md:mb-20">
          <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.4em] text-gold-text md:text-sm">
            Revue de presse · Édition spéciale
          </p>

          <div className="mb-4 flex items-center gap-4 sm:gap-8">
            <span aria-hidden="true" className="h-px flex-1 bg-foreground/40" />
            <h2 className="text-4xl italic leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              La Presse en Parle
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-foreground/40" />
          </div>

          <div aria-hidden="true" className="mx-auto h-[3px] w-full bg-foreground" />
          <div aria-hidden="true" className="mx-auto mt-[3px] h-px w-full bg-foreground/60" />

          <div className="mt-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground sm:text-sm">
            <span>Rouge-Cardinal</span>
            <span>
              {mediaArticles.length} article
              {mediaArticles.length > 1 ? "s" : ""} référencé
              {mediaArticles.length > 1 ? "s" : ""}
            </span>
          </div>
        </header>

        {/* À la une */}
        <article className="mb-14 grid grid-cols-1 gap-10 border-b-2 border-foreground/80 pb-14 md:mb-20 md:pb-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {featured.image_url && (
              <figure className="mb-6 w-56 sm:float-left sm:mb-4 sm:mr-8 sm:w-64 md:w-72 lg:w-80">
                <div className="relative aspect-[2/3] overflow-hidden border border-foreground/70 bg-muted shadow-[0_18px_45px_rgba(10,10,10,0.32)] grayscale contrast-125 transition-[filter] duration-500 hover:grayscale-0">
                  <Image
                    src={featured.image_url}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                  Photo · {featured.source_publication}
                </figcaption>
              </figure>
            )}

            <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-text sm:text-sm">
              <span>À la une</span>
              <span aria-hidden="true" className="text-foreground/30">
                —
              </span>
              <span className="font-semibold text-foreground/70">
                {featured.type}
              </span>
              <span aria-hidden="true" className="text-foreground/30">
                ·
              </span>
              <span className="font-semibold text-foreground/70">
                {featured.source_publication}
              </span>
              <span aria-hidden="true" className="text-foreground/30">
                ·
              </span>
              <span className="font-normal normal-case tracking-normal text-muted-foreground">
                {formatGazetteDate(featured.published_at)}
              </span>
            </p>

            <h3 className="mb-4 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-3xl md:text-4xl">
              {featured.title}
            </h3>

            {featured.chapo && (
              <p className="max-w-prose font-sans text-base lg:text-xl leading-relaxed text-foreground/90 first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:italic first-letter:leading-[0.75] first-letter:text-primary sm:text-lg">
                {featured.chapo}
              </p>
            )}

            <p className="mt-4 font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Par {featured.author}
            </p>

            <Link
              href={featured.source_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Lire l'article : ${featured.title} (s'ouvre dans un nouvel onglet)`}
              className="mt-6 inline-flex items-center gap-2 border-b-2 border-primary hover:border-chart-2 pb-0.5 font-sans text-lg font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:text-chart-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Lire l&apos;article
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {featured.excerpt && (
            <div className="lg:col-span-5">
              <div className="border-t-4 border-primary pt-6">
                <p className="font-serif text-2xl italic leading-snug text-foreground/90">
                  <span
                    aria-hidden="true"
                    className="mr-0.5 font-serif text-3xl not-italic text-primary sm:text-4xl"
                  >
                    «
                  </span>
                  {featured.excerpt}
                  <span
                    aria-hidden="true"
                    className="ml-0.5 font-serif text-3xl not-italic text-primary sm:text-4xl"
                  >
                    »
                  </span>
                </p>
                <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {featured.source_publication}
                </p>
              </div>
            </div>
          )}
        </article>

        {/* En bref */}
        {briefs.length > 0 && (
          <div>
            <div className="pt-16 mb-10 flex items-center gap-4">
              <h3 className="whitespace-nowrap font-sans text-base font-bold uppercase tracking-[0.3em] text-foreground">
                En bref
              </h3>
              <span aria-hidden="true" className="h-px flex-1 bg-foreground/25" />
            </div>

            <div className="columns-1 gap-x-12 sm:columns-2 lg:columns-3 [column-rule:1px_solid_hsl(var(--border))]">
              {briefs.map((article, index) => (
                <article
                  key={article.id}
                  className="mb-10 break-inside-avoid animate-fade-in-up border-b border-foreground/15 pb-8"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-gold-text sm:text-xs">
                    {article.type}
                  </p>

                  <h4 className="mb-2 text-3xl font-semibold leading-snug">
                    {article.title}
                  </h4>

                  <p className="mb-2 font-sans text-xs uppercase tracking-wide text-muted-foreground">
                    {formatGazetteDate(article.published_at)}
                  </p>

                  {(article.chapo || article.excerpt) && (
                    <p className="mb-3 font-sans text-lg leading-relaxed text-foreground/80">
                      {article.chapo || article.excerpt}
                    </p>
                  )}

                  <p className="mb-3 font-sans text-sm italic text-muted-foreground">
                    Par {article.author}
                  </p>

                  <Link
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Lire l'article : ${article.title} (s'ouvre dans un nouvel onglet)`}
                    className="inline-flex items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-[0.15em] text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-chart-2 hover:decoration-chart-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Lire l&apos;article
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

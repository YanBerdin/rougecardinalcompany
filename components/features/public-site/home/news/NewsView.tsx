import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { NewsViewProps } from "./types";
import { Button } from "@/components/ui/button";

function formatGazetteDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function NewsView({ news }: NewsViewProps) {
  if (news.length === 0)
    return null;

  return (
    <section
      aria-labelledby="news-heading"
      className="relative overflow-hidden bg-chart-7 py-24 xl:py-32 text-foreground md:pt-16 md:pb-32"
    >
      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <header className="">
          <div className="mb-4 flex flex-col gap-4 sm:gap-5 justify-center">
            <h2
              id="news-heading"
              className="text-4xl italic font-semibold leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mx-auto text-center"
            >
              La presse en parle
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-center">
              Suivez les actualités de la compagnie
            </p>
          </div>
        </header>

        <div className="py-16 columns-1 gap-x-12 sm:columns-2 lg:columns-3 [column-rule:1px_solid_hsl(var(--border))]">
          {news.map((item, index) => {
            const href = item.source_url || "/presse";
            const isExternal = href.startsWith("http");

            return (
              <article
                key={item.id}
                className="mb-10 break-inside-avoid animate-fade-in-up border-b border-foreground/15 pb-8"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-gold-text sm:text-xs">
                  {item.type}
                </p>

                <h4 className="mb-2 text-3xl sm:text-5xl font-semibold leading-snug">{item.title}</h4>

                <p className="mb-2 font-sans text-xs uppercase tracking-wide text-muted-foreground">
                  {item.source_publication} · {formatGazetteDate(item.date)}
                </p>

                {item.short_description && (
                  <p className="mb-3 font-sans text-lg leading-relaxed text-foreground/80">{item.short_description}</p>
                )}

                <Link
                  href={href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={`Lire l'article : ${item.title} ${isExternal ? "(s'ouvre dans un nouvel onglet)" : ""}`}
                  className="inline-flex items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-[0.15em] text-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-chart-2 hover:decoration-chart-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Lire l&apos;article
                  {isExternal && <ExternalLink className="size-3" aria-hidden />}
                </Link>
              </article>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="default" size="default" asChild className="cta-blur-button">
            <Link href="/presse">
              <ArrowRight className="size-5" aria-hidden="true" />
              Voir toute l&apos;actualité
            </Link>
          </Button>
        </div>
      </div>

    </section >
  );
}

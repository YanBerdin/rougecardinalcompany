import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { NewsItem } from "./types";

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

const PRESSE_FALLBACK_HREF = "/presse";

function getArticleHref(item: NewsItem) {
  return item.source_url || PRESSE_FALLBACK_HREF;
}

function isExternalHref(href: string) {
  return href.startsWith("http");
}

export function NewsCard({ item, index }: NewsCardProps) {
  const articleHref = getArticleHref(item);
  const isExternal = isExternalHref(articleHref);
  const externalProps = isExternal
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  const badgeLabel = item.source_publication || item.category;

  return (
    <Card
      className="card-hover animate-fade-in-up w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {item.image ? (
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="relative h-48">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {badgeLabel}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-6">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {badgeLabel}
          </span>
        </div>
      )}

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-center card-date text-sm mb-3">
          <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
          <time dateTime={item.date}>
            {new Date(item.date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        <h3 className="text-xl font-semibold font-sans mb-3 hover:text-primary transition-colors card-title">
          <Link href={articleHref} {...externalProps}>
            {item.title}
            {isExternal && (
              <ExternalLink
                className="inline-block h-3.5 w-3.5 ml-1.5 align-baseline"
                aria-hidden="true"
              />
            )}
            {isExternal && (
              <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
            )}
          </Link>
        </h3>
        <p className="leading-relaxed card-text">{item.short_description}</p>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button variant="secondary" size="lg" asChild>
          <Link href={articleHref} {...externalProps}>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            Lire la suite
            {isExternal && (
              <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

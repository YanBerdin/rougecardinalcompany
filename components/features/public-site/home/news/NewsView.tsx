import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsViewProps } from "./types";
import { NewsCard } from "./NewsCard";

export function NewsView({ news }: NewsViewProps) {
  if (news.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background" aria-labelledby="news-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="news-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            À la Une
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Suivez l&apos;actualité de la compagnie Rouge-Cardinal
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {news.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="default" size="default" asChild className="cta-blur-button">
            <Link href="/presse">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
              Voir toutes les actualités
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

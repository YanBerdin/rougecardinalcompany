import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowsViewProps } from "./types";
import { ShowCard } from "./ShowCard";

export function ShowsView({ shows }: ShowsViewProps) {
  return (
    <section className="py-24 lg:py-32 bg-background" aria-labelledby="shows-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 gap-4">
          <div>
            <h2 id="shows-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              À l&apos;affiche
            </h2>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez la programmation
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {shows.map((show, index) => (
            <ShowCard key={show.id} show={show} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="default" size="lg" asChild>
            <Link href="/agenda">
              <ArrowRight className="size-5" aria-hidden="true" />
              Voir l&apos;agenda
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowsViewProps } from "./types";
import { ShowCard } from "./ShowCard";

export function ShowsView({ shows }: ShowsViewProps) {
  return (
    <section className="py-24 bg-chart-7" aria-labelledby="shows-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="shows-heading" className="text-3xl md:text-4xl lg:text-5xl font-semibold font-sans mb-4">
            Prochains Événements
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre programmation et réservez vos places
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-16 mb-12">
          {shows.map((show, index) => (
            <ShowCard key={show.id} show={show} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="default" size="lg" asChild>
            <Link href="/agenda">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
              Voir tout l&apos;agenda
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

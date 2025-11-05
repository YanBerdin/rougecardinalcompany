import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShowsViewProps } from "./types";

export function ShowsView({ shows }: ShowsViewProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Prochains Spectacles</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre programmation et réservez vos places
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {shows.map((show, index) => (
            <Card
              key={show.id}
              className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${show.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white card-meta">
                  <div className="text-sm opacity-90">
                    {show.dates && show.dates.length > 0
                      ? `${show.dates.length} dates`
                      : "Dates à venir"}
                  </div>
                </div>
              </div>

              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors card-title">
                  <Link href={`/spectacles/${show.slug}`}>{show.title}</Link>
                </h3>
                <p className="mb-4 text-sm leading-relaxed card-text">
                  {show.short_description}
                </p>

                {show.dates && show.dates.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {show.dates.slice(0, 3).map((date, i) => (
                      <Badge key={i} variant="outline" className="font-normal">
                        {new Date(date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Badge>
                    ))}
                    {show.dates.length > 3 && (
                      <Badge variant="outline" className="font-normal">
                        +{show.dates.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 mt-auto">
                <div className="flex space-x-2 w-full">
                  <Button
                    size="lg"
                    className="flex-1 btn-primary bg-red"
                    asChild
                  >
                    <Link href={`/spectacles/${show.slug}`}>Réserver</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="btn-outline"
                  >
                    <Link href={`/spectacles/${show.slug}`}>Détails</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="cta-blur-button"
          >
            <Link href="/agenda">
              Voir tout l&apos;agenda
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

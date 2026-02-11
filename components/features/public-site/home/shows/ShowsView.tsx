import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShowsViewProps } from "./types";

export function ShowsView({ shows }: ShowsViewProps) {
  return (
    <section className="py-20 bg-card/40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Prochains Spectacles</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre programmation et réservez vos places
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-16 mb-12">
          {shows.map((show, index) => (
            <Card
              key={show.id}
              className={`card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm group border-0 shadow-none bg-transparent hover:bg-card`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/spectacles/${show.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${show.image})` }}
                  />

                  {/* Hover overlay with buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex flex-col gap-3 px-6 w-full">
                      <Button variant="default" size="lg" className="w-full" asChild>
                        <span>
                          <ArrowRight className="h-4 w-4" />
                          Je réserve
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-white/40 border-white text-chart-6 hover:bg-chart-6 hover:text-black shadow-lg"
                        asChild
                      >
                        <span>
                          <Play className="h-5 w-5" />
                          Détails
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {show.dates && show.dates.length > 0 && (
                  <>
                    {show.dates.slice(0, 3).map((date, i) => (
                      <Badge key={i} className="bg-primary text-primary-foreground">
                        {new Date(date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Badge>
                    ))}
                    {show.dates.length > 3 && (
                      <Badge className="bg-primary/80 text-primary-foreground">
                        +{show.dates.length - 3} dates
                      </Badge>
                    )}
                  </>
                )}
                {(!show.dates || show.dates.length === 0) && (
                  <Badge className="bg-muted text-muted-foreground">
                    Dates à venir
                  </Badge>
                )}
              </div>

              {/* Card Footer */}
              <div className="py-2 text-center">
                <h3 className="text-xl font-bold text-foreground line-clamp-2">
                  {show.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {show.short_description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="default"
            size="lg"
            asChild
            className=""
          >
            <Link href="/agenda">
              <ArrowRight className="h-5 w-5" />
              Voir tout l&apos;agenda
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

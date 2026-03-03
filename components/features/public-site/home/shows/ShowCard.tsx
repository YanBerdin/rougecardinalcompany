import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Show } from "./types";

interface ShowCardProps {
  show: Show;
  index: number;
}

export function ShowCard({ show, index }: ShowCardProps) {
  return (
    <Card
      className="card-hover animate-fade-in-up overflow-hidden w-full md:w-[calc(50%-1rem)] max-w-md group border-0 shadow-none bg-transparent"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link href={`/spectacles/${show.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
          <Image
            src={show.image}
            alt={show.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay — visible au survol ET au focus clavier */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex flex-col gap-3 px-6 w-full">
              <Button variant="default" size="lg" className="w-full" asChild>
                <span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                  <Play className="h-5 w-5" aria-hidden="true" />
                  Détails
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Link>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 justify-center pt-4">
        {show.genre && (
          <Badge className="bg-primary text-primary-foreground">{show.genre}</Badge>
        )}
        {show.dates && show.dates.length > 0 ? (
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
        ) : (
          <Badge className="bg-muted text-muted-foreground">Dates à venir</Badge>
        )}
      </div>

      {/* Titre */}
      <div className="py-2 text-center">
        <h3 className="text-xl font-bold text-foreground line-clamp-2">
          <Link href={`/spectacles/${show.slug}`}>{show.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {show.short_description}
        </p>
      </div>
    </Card>
  );
}

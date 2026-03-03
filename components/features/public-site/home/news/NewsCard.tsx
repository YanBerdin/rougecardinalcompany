import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { NewsItem } from "./types";

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

export function NewsCard({ item, index }: NewsCardProps) {
  return (
    <Card
      className="card-hover animate-fade-in-up w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
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
            {item.category}
          </span>
        </div>
      </div>

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

        <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors card-title">
          <Link href={`/actualites/${item.id}`}>{item.title}</Link>
        </h3>
        <p className="leading-relaxed card-text">{item.short_description}</p>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button variant="secondary" size="lg" asChild>
          <Link href={`/actualites/${item.id}`}>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            Lire la suite
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

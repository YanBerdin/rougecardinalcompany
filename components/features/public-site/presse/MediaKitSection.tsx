/**
 * @file MediaKitSection — Kit média téléchargeable (logos, photos, dossiers)
 */
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaKitItem } from "@/lib/schemas/presse";

interface MediaKitSectionProps {
  mediaKit: MediaKitItem[];
}

export function MediaKitSection({ mediaKit }: MediaKitSectionProps) {
  if (mediaKit.length === 0) return null;

  return (
    <section aria-label="Kit Média" className="py-24 bg-chart-7">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold font-sans mb-4">Kit Média</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ressources haute qualité pour vos publications
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {mediaKit.map((item, index) => {
            const Icon = item.icon ?? FileText;
            return (
              <Card
                key={index}
                className="card-hover animate-fade-in-up text-center w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4 mx-auto">
                    <Icon
                      className="h-8 w-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-3">{item.type}</h2>
                  <p className="text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Taille : {item.fileSize}
                  </p>
                  <Button variant="secondary" className="w-full mt-auto" asChild>
                    <Link
                      href={item.fileUrl}
                      download
                      aria-label={`Télécharger ${item.type} - ${item.description} (${item.fileSize})`}
                    >
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Télécharger
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

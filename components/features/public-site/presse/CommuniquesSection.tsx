/**
 * @file CommuniquesSection — Communiqués de presse officiels téléchargeables
 */
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PressRelease } from "@/lib/schemas/presse";

interface CommuniquesSectionProps {
  pressReleases: PressRelease[];
}

export function CommuniquesSection({
  pressReleases,
}: CommuniquesSectionProps) {
  if (pressReleases.length === 0) return null;

  return (
    <section aria-label="Communiqués de presse" className="py-24">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-semibold font-sans mb-4">
            Communiqués de Presse
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Les dernières actualités officielles de la compagnie
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {pressReleases.map((release, index) => (
            <Card
              key={release.id}
              className="card-hover animate-fade-in-up w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {new Date(release.date).toLocaleDateString("fr-FR")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {release.fileSize}
                  </span>
                </div>
                <CardTitle className="text-lg">{release.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed flex-1">
                  {release.description}
                </p>
                <Button variant="secondary" className="w-full mt-auto" asChild>
                  <Link
                    href={release.fileUrl}
                    download
                    aria-label={`Télécharger ${release.title} (${release.fileSize})`}
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Télécharger le PDF
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

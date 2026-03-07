/**
 * @file RevueDePresse — Articles de médias sur Rouge-Cardinal (revue de presse)
 */
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MediaArticle } from "@/lib/schemas/presse";

interface RevueDePresseSectionProps {
  mediaArticles: MediaArticle[];
}

export function RevueDePresse({ mediaArticles }: RevueDePresseSectionProps) {
  return (
    <section aria-label="Revue de presse" className="py-24 bg-chart-7">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-bold font-sans mb-4">
            Revue de Presse
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ce que les médias disent de Rouge-Cardinal
          </p>
        </div>

        <div className="space-y-6">
          {mediaArticles.map((article, index) => (
            <Card
              key={article.id}
              className="card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge
                        variant={
                          article.type === "Critique"
                            ? "default"
                            : article.type === "Interview"
                              ? "secondary"
                              : article.type === "Portrait"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {article.type}
                      </Badge>
                      <span className="text-sm text-primary font-medium">
                        {article.source_publication}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(article.published_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>

                    <h2 className="text-xl font-semibold font-sans mb-2">
                      {article.title}
                    </h2>

                    {article.chapo && (
                      <p className="text-muted-foreground mb-2">
                        {article.chapo}
                      </p>
                    )}

                    {article.excerpt && (
                      <p className="text-muted-foreground mb-3 italic">
                        &quot;{article.excerpt}&quot;
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Par {article.author}
                    </p>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end">
                    <Button variant="secondary" asChild>
                      <Link
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Lire l'article : ${article.title} (s'ouvre dans un nouvel onglet)`}
                      >
                        <ExternalLink
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Lire l&apos;article
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

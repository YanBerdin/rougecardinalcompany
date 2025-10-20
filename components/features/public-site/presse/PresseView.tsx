"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PresseViewProps } from "./types";

/**
 * Composant de présentation (dumb) pour la page Presse
 * Responsable uniquement du rendu UI, sans logique métier
 */
export function PresseView({
  pressReleases,
  mediaArticles,
  mediaKit,
}: PresseViewProps) {
  // console.log("pressReleases", pressReleases, "mediaArticles", mediaArticles, "mediaKit", mediaKit); //TODO: remove
  // console.log("mediaArticles", mediaArticles); //TODO: remove
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Espace Presse
          </h1>
          <p
            className="text-xl md:text-2xl opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Ressources et actualités pour les médias
          </p>
        </div>
      </section>

      {/* Contact Presse */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Presse</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <strong>Marie Dubois</strong> - Directrice artistique
                    </p>
                    <p>📧 presse@rouge-cardinal.fr</p>
                    <p>📱 +33 6 12 34 56 78</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Informations pratiques
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Délai de réponse : 24-48h</p>
                    <p>Accréditations disponibles</p>
                    <p>Interviews et photos sur demande</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Communiqués de Presse */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Communiqués de Presse</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Les dernières actualités officielles de la compagnie
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {pressReleases.map((release, index) => (
              <Card
                key={release.id}
                className={`card-hover animate-fade-in-up w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col`}
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
                  <Button className="w-full mt-auto hover:bg-muted" asChild>
                    <a href={release.fileUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le PDF
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revue de Presse */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Revue de Presse</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ce que les médias disent de Rouge-Cardinal
            </p>
          </div>

          <div className="space-y-6">
            {mediaArticles.map((article, index) => (
              <Card
                key={article.id}
                className={`card-hover animate-fade-in-up`}
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

                      <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-muted-foreground mb-3 italic">
                        &quot;{article.excerpt}&quot;
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Par {article.author}
                      </p>
                    </div>

                    <div className="flex items-center justify-center lg:justify-end">
                      <Button variant="outline" asChild>
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Lire l&apos;article
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kit Média */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Kit Média</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ressources haute qualité pour vos publications
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {mediaKit.map((item, index) => {
              const Icon = item.icon ?? FileText;
              return (
                <Card
                  key={index}
                  className={`card-hover animate-fade-in-up text-center w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4 mx-auto">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>

                    <h3 className="text-xl font-semibold mb-3">{item.type}</h3>
                    <p className="text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Taille : {item.fileSize}
                    </p>

                    <Button className="w-full mt-auto" asChild>
                      <a href={item.fileUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accréditation */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Demande d&apos;Accréditation
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Journalistes et critiques, demandez votre accréditation pour nos
            spectacles
          </p>
          <div className="space-y-4 text-white/90 mb-8">
            <p>
              Pour toute demande d&apos;accréditation, merci d&apos;envoyer un
              email à
              <strong className="text-white"> presse@rouge-cardinal.fr</strong>{" "}
              en précisant :
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li>• Votre nom et média</li>
              <li>• Le spectacle qui vous intéresse</li>
              <li>• La date souhaitée</li>
              <li>• Votre carte de presse</li>
            </ul>
          </div>
          <Button
            size="lg"
            className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 shadow-lg border"
            asChild
          >
            <a href="mailto:presse@rouge-cardinal.fr?subject=Demande%20d%27accr%C3%A9ditation">
              Faire une demande
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

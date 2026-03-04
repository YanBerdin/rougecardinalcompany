/**
 * @file ContactPresseSection — Contact et informations pratiques pour les médias
 */
import { Card, CardContent } from "@/components/ui/card";

export function ContactPresseSection() {
  return (
    <section aria-label="Contact presse" className="pt-24 bg-chart-7">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold font-sans mb-3">
                  Contact Presse
                </h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Marie Dubois</strong> - Directrice artistique
                  </p>
                  <p>📧 presse@rouge-cardinal.fr</p>
                  <p>📱 +33 6 12 34 56 78</p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold font-sans mb-3">
                  Informations pratiques
                </h2>
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
  );
}

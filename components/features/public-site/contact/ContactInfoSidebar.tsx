import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterCard } from "./NewsletterCard";

interface ContactInfoSidebarProps {
  showNewsletter: boolean;
}

export function ContactInfoSidebar({
  showNewsletter,
}: ContactInfoSidebarProps): React.JSX.Element {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Nos Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mail className="size-5 text-chart-2 mt-1" aria-hidden="true" />
            <div>
              <p className="font-medium">Email</p>
              <Link
                href="mailto:contact@rouge-cardinal.fr"
                className="text-muted-foreground hover:text-chart-2"
                aria-label="Envoyer un email à contact@rouge-cardinal.fr"
              >
                contact@rouge-cardinal.fr
              </Link>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="size-5 text-chart-2 mt-1" aria-hidden="true" />
            <div>
              <p className="font-medium">Téléphone</p>
              <Link
                href="tel:+33123456789"
                className="text-muted-foreground hover:text-chart-2"
                aria-label="Appeler le +33 1 23 45 67 89"
              >
                +33 1 23 45 67 89
              </Link>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="size-5 text-chart-2 mt-1" aria-hidden="true" />
            <div>
              <p className="font-medium">Adresse</p>
              <p className="text-muted-foreground">
                12 Rue de la République
                <br />
                75011 Paris, France
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showNewsletter && <NewsletterCard />}
    </div>
  );
}
